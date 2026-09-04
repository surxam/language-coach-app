// ============================================================
// services/ai.service.js
//
// Utilise GROQ (gratuit) pour :
//   - Transcription audio : Whisper via Groq
//   - Dialogue coach IA   : GPT OSS 120B via Groq
//   - Analyse de fin      : GPT OSS 120B via Groq
//
// Variable d'env requise dans backend/.env :
//   GROQ_API_KEY  → https://console.groq.com (gratuit, sans CB)
//
// Si la clé est absente : fallback mock pour tester le flux.
// ============================================================

const GROQ_BASE = "https://api.groq.com/openai/v1";
const CHAT_MODEL = "openai/gpt-oss-120b";

// ─── Appel LLM (chat completion OpenAI-compatible) ───────────

async function callGroq(system, messages, model = CHAT_MODEL, maxTokens = 600) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY absente du fichier backend/.env");
  }

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq LLM ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ─── 1) Transcription audio (Whisper via Groq) ───────────────
// Groq expose Whisper via une API compatible OpenAI.
// Utilise FormData + Blob natifs (Node 18+, aucune dépendance).

async function transcribeAudio(audioBuffer) {
  if (!audioBuffer || audioBuffer.length < 500) {
    return "__UNCLEAR__";
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    console.warn(
      "⚠️  GROQ_API_KEY absente — transcription non disponible (mock activé).\n" +
      "   Créez un compte gratuit sur https://console.groq.com"
    );
    return "__MOCK_STT__";
  }

  try {
    const form = new FormData();
    // Groq Whisper accepte m4a, mp3, wav, webm, ogg, flac, mp4
    const blob = new Blob([audioBuffer], { type: "audio/m4a" });
    form.append("file", blob, "speech.m4a");
    form.append("model", "whisper-large-v3-turbo"); // modèle Groq le plus rapide
    form.append("language", "en");                   // force la langue anglaise
    form.append("response_format", "json");

    const res = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();

      console.error("================================");
      console.error("WHISPER STATUS:", res.status);
      console.error("WHISPER BODY:", err);
      console.error("================================");
      console.log("Audio size:", audioBuffer.length);
      console.log("Blob type:", "audio/m4a");
      return "__UNCLEAR__";
    }

    const data = await res.json();
    const text = (data.text || "").trim();
    return text || "__UNCLEAR__";
  } catch (err) {
    console.error("transcribeAudio exception:", err.message);
    return "__UNCLEAR__";
  }
}

// ─── 2) Réponse du coach IA ──────────────────────────────────

const COACH_SYSTEM = `You are an English conversation coach called "Coach AI".

STRICT RULES — apply at every single turn without exception:

1. ENGLISH ONLY. If the user writes or speaks in any language other than English
   (French, Spanish, Arabic, etc.), do NOT answer in that language.
   Respond only in English and politely ask them to switch:
   "I'm sorry, but we can only practice English together.
    Could you please say that again in English ?"

2. CORRECT ERRORS NATURALLY. If the user makes a grammar or vocabulary mistake,
   briefly acknowledge it and model the correct form before continuing.
   Example — user says "I have went there":
   → "Quick note: it's 'I went there' — simple past, no 'have' needed.
      Anyway, tell me more !"

3. ASK TO REPEAT when the input is "__UNCLEAR__" or "__MOCK_STT__":
   "Sorry, I didn't quite catch that. Could you repeat a little more clearly ?"

4. TOPIC FREEDOM. Follow the student's lead on any subject
   (travel, food, work, movies, sports, daily life…).
   If no topic yet, open with a warm, simple question.

5. Keep replies SHORT — 2 to 4 sentences maximum. Be friendly and encouraging.`;

async function getAIReply(userText, history = []) {
  const messages = [
    ...history,
    { role: "user", content: userText || "__UNCLEAR__" },
  ];

  try {
    return await callGroq(COACH_SYSTEM, messages, CHAT_MODEL, 300);
  } catch (err) {
    console.error("getAIReply error:", err.message);
    throw err; // remonté au contrôleur qui applique le fallback
  }
}


// ─── 3) Bilan de fin de session ──────────────────────────────

const CORRECTION_SYSTEM = `You are an expert English language analyst.
Analyze the student's messages in the transcript (lines starting with "Student:").

Return ONLY a valid JSON object — no markdown, no backticks, no explanation:
{
  "theme": "<main topic in 1-3 English words>",
  "errors": [
    { "wrong": "<what the student said>", "right": "<corrected form>" }
  ],
  "newWords": [
    { "word": "<English word>", "translation": "<French translation>" }
  ],
  "score": <float 1.0-10.0 reflecting grammar/fluency quality>
}

Rules:
- errors: real grammar or vocabulary mistakes only, 5 max. Empty array [] if none.
- newWords: useful vocabulary from the conversation, 5 max. Empty array [] if none.
- score: realistic — many errors = low, few = high. One decimal place.
- If transcript is empty or only contains "__UNCLEAR__" / "__MOCK_STT__":
  return { "theme": "Unknown", "errors": [], "newWords": [], "score": 5.0 }`;

async function generateCorrection(transcript = []) {
  const hasReal = transcript.some(
    (m) =>
      m.role === "user" &&
      m.content !== "__UNCLEAR__" &&
      m.content !== "__MOCK_STT__"
  );

  if (!hasReal) {
    return { theme: "Session courte", errors: [], newWords: [], score: 5.0 };
  }

  const text = transcript
    .map((m) => `${m.role === "user" ? "Student" : "Coach"}: ${m.content}`)
    .join("\n");

  try {
    const raw = await callGroq(
      CORRECTION_SYSTEM,
      [{ role: "user", content: text }],
      CHAT_MODEL,
      600
    );

    // Sécurité : retire d'éventuels backticks que le modèle pourrait ajouter
    const clean = raw.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(clean);

    return {
      theme: parsed.theme || "General",
      errors: Array.isArray(parsed.errors) ? parsed.errors.slice(0, 5) : [],
      newWords: Array.isArray(parsed.newWords) ? parsed.newWords.slice(0, 5) : [],
      score: typeof parsed.score === "number" ? parsed.score : 5.0,
    };
  } catch (err) {
    console.error("generateCorrection error:", err.message);
    return { theme: "General", errors: [], newWords: [], score: 5.0 };
  }
}

module.exports = { transcribeAudio, getAIReply, generateCorrection };
