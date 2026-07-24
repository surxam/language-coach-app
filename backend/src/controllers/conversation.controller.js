const { pool } = require("../config/db");
const { transcribeAudio, getAIReply, generateCorrection } = require("../services/ai.service");

// POST /api/conversations
async function startConversation(req, res) {
  try {
    const [result] = await pool.query(
      "INSERT INTO conversations (user_id, started_at) VALUES (?, NOW())",
      [req.user.id]
    );
    const [rows] = await pool.query(
      "SELECT id, user_id, started_at, ended_at FROM conversations WHERE id = ?",
      [result.insertId]
    );
    return res.status(201).json({ conversation: rows[0] });
  } catch (err) {
    console.error("startConversation error:", err);
    return res.status(500).json({ message: "Impossible de démarrer la conversation." });
  }
}

// POST /api/conversations/:id/respond
// multipart/form-data :
//   audio   — fichier audio
//   history — JSON stringifié des échanges précédents
async function respond(req, res) {
  try {
    const { id } = req.params;
    const [conv] = await pool.query(
      "SELECT id FROM conversations WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (conv.length === 0) {
      return res.status(404).json({ message: "Conversation introuvable." });
    }

    // — Transcription audio
    const audioBuffer = req.file ? req.file.buffer : null;
    let userText;
    try {
      userText = await transcribeAudio(audioBuffer);
    } catch (sttErr) {
      console.error("STT error (non-fatal, using UNCLEAR):", sttErr.message);
      userText = "__UNCLEAR__";
    }

    // — Historique envoyé par le mobile (champ texte dans le multipart)
    let history = [];
    const rawHistory = req.body && (req.body.history ?? req.body["history"]);
    if (rawHistory) {
      try {
        history = JSON.parse(rawHistory);
      } catch (e) {
        console.warn("Impossible de parser history:", e.message);
      }
    }

    // — Réponse du coach IA
    let aiText;
    try {
      aiText = await getAIReply(userText, history);
    } catch (aiErr) {
      console.error("getAIReply error:", aiErr.message);
      // Renvoie un message de fallback au lieu de planter
      aiText = "I'm sorry, I'm having a little trouble right now. Could you try again?";
    }

    return res.json({ userText, aiText });
  } catch (err) {
    console.error("respond error (unhandled):", err);
    return res.status(500).json({ message: "Erreur lors du traitement de la réponse IA." });
  }
}

// PATCH /api/conversations/:id/end
async function endConversation(req, res) {
  try {
    const { id } = req.params;
    const [conv] = await pool.query(
      "SELECT id FROM conversations WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (conv.length === 0) {
      return res.status(404).json({ message: "Conversation introuvable." });
    }

    await pool.query("UPDATE conversations SET ended_at = NOW() WHERE id = ?", [id]);

    const transcript = Array.isArray(req.body?.transcript) ? req.body.transcript : [];

    let correctionData;
    try {
      correctionData = await generateCorrection(transcript);
    } catch (corrErr) {
      console.error("generateCorrection error (using default):", corrErr.message);
      correctionData = {
        theme: "General",
        errors: [],
        newWords: [],
        score: 5.0,
      };
    }

    const [result] = await pool.query(
      "INSERT INTO corrections (conversation_id, feedback, score) VALUES (?, ?, ?)",
      [id, JSON.stringify(correctionData), correctionData.score]
    );

    const [rows] = await pool.query(
      `SELECT c.id, c.user_id, c.started_at, c.ended_at,
              co.id AS correction_id, co.feedback, co.score
       FROM conversations c
       LEFT JOIN corrections co ON co.id = ?
       WHERE c.id = ?`,
      [result.insertId, id]
    );

    return res.json({ conversation: formatRow(rows[0]) });
  } catch (err) {
    console.error("endConversation error:", err);
    return res.status(500).json({ message: "Impossible de terminer la conversation." });
  }
}

// GET /api/conversations
async function listConversations(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.user_id, c.started_at, c.ended_at,
              co.id AS correction_id, co.feedback, co.score
       FROM conversations c
       LEFT JOIN corrections co ON co.conversation_id = c.id
       WHERE c.user_id = ?
       ORDER BY c.started_at DESC`,
      [req.user.id]
    );
    return res.json({ conversations: rows.map(formatRow) });
  } catch (err) {
    console.error("listConversations error:", err);
    return res.status(500).json({ message: "Impossible de récupérer l'historique." });
  }
}

// GET /api/conversations/:id
async function getConversation(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT c.id, c.user_id, c.started_at, c.ended_at,
              co.id AS correction_id, co.feedback, co.score
       FROM conversations c
       LEFT JOIN corrections co ON co.conversation_id = c.id
       WHERE c.id = ? AND c.user_id = ?`,
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Conversation introuvable." });
    }
    return res.json({ conversation: formatRow(rows[0]) });
  } catch (err) {
    console.error("getConversation error:", err);
    return res.status(500).json({ message: "Impossible de récupérer la conversation." });
  }
}

// DELETE /api/conversations/:id
async function deleteConversation(req, res) {
  try {
    const { id } = req.params;
    const [conv] = await pool.query(
      "SELECT id FROM conversations WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (conv.length === 0) {
      return res.status(404).json({ message: "Conversation introuvable." });
    }
    // La suppression cascade automatiquement sur `corrections`
    // (contrainte ON DELETE CASCADE définie dans le schéma SQL).
    await pool.query("DELETE FROM conversations WHERE id = ?", [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error("deleteConversation error:", err);
    return res.status(500).json({ message: "Impossible de supprimer la conversation." });
  }
}

function formatRow(row) {
  const startedAt = row.started_at;
  const endedAt = row.ended_at;
  let durationMin = null;
  if (startedAt && endedAt) {
    durationMin = Math.max(1, Math.round((new Date(endedAt) - new Date(startedAt)) / 60000));
  }
  let feedback = null;
  if (row.feedback) {
    feedback = typeof row.feedback === "string" ? JSON.parse(row.feedback) : row.feedback;
  }
  return {
    id: row.id,
    userId: row.user_id,
    startedAt,
    endedAt,
    durationMin,
    correction: row.correction_id
      ? { id: row.correction_id, score: Number(row.score), feedback }
      : null,
  };
}

module.exports = {
  startConversation,
  respond,
  endConversation,
  listConversations,
  getConversation,
  deleteConversation,
};
