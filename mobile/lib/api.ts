import { getToken } from "./storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean; formData?: FormData } = {}
): Promise<T> {
  const { method = "GET", body, auth = true, formData } = options;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.message || "Une erreur est survenue.", res.status);
  }
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────

export type User = { id: number; name: string; email: string };

export function signup(name: string, email: string, password: string) {
  return request<{ token: string; user: User }>("/auth/signup", {
    method: "POST",
    body: { name, email, password },
    auth: false,
  });
}

export function login(email: string, password: string) {
  return request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function fetchMe() {
  return request<{ user: User }>("/auth/me");
}

// ─── Conversations ───────────────────────────────────────────

export type HistoryEntry = { role: "user" | "assistant"; content: string };

export type CorrectionFeedback = {
  theme: string;
  errors: { wrong: string; right: string }[];
  newWords: { word: string; translation: string }[];
};

export type Conversation = {
  id: number;
  userId: number;
  startedAt: string;
  endedAt: string | null;
  durationMin: number | null;
  correction: { id: number; score: number; feedback: CorrectionFeedback } | null;
};

export function startConversation() {
  return request<{ conversation: Conversation }>("/conversations", { method: "POST" });
}

// Envoie l'audio + tout l'historique des échanges précédents au backend.
// Le backend transcrit l'audio, passe l'historique à Claude et renvoie
// la réponse du coach ainsi que la transcription de ce que l'utilisateur a dit.
//
// L'upload audio est plus sensible aux petits accrocs Wi-Fi qu'une simple
// requête JSON : on ajoute donc un timeout et une nouvelle tentative
// automatique avant d'abandonner et de remonter l'erreur à l'utilisateur.
export async function respondToAudio(
  conversationId: number,
  audioUri: string,
  history: HistoryEntry[]
) {
  const token = await getToken();

  const attempt = async (): Promise<{ userText: string; aiText: string }> => {
    const formData = new FormData();
    formData.append("audio", {
      uri: audioUri,
      name: "speech.m4a",
      type: "audio/m4a",
    } as unknown as Blob);
    formData.append("history", JSON.stringify(history));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${API_URL}/api/conversations/${conversationId}/respond`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(data.message || "Erreur réponse IA.", res.status);
      return data as { userText: string; aiText: string };
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await attempt();
  } catch (err) {
    // Une ApiError vient du serveur (erreur métier) : inutile de réessayer.
    if (err instanceof ApiError) throw err;
    // Sinon (coupure réseau, timeout...) : une seule nouvelle tentative.
    console.warn("respondToAudio: échec réseau, nouvelle tentative...", err);
    await new Promise((r) => setTimeout(r, 800));
    return attempt();
  }
}

// Termine la conversation et envoie le transcript complet pour que le
// backend génère une correction réelle basée sur la vraie conversation.
export function endConversation(conversationId: number, transcript: HistoryEntry[]) {
  return request<{ conversation: Conversation }>(`/conversations/${conversationId}/end`, {
    method: "PATCH",
    body: { transcript },
  });
}

export function listConversations() {
  return request<{ conversations: Conversation[] }>("/conversations");
}

export function getConversation(conversationId: number) {
  return request<{ conversation: Conversation }>(`/conversations/${conversationId}`);
}

export function deleteConversation(conversationId: number) {
  return request<{ success: boolean }>(`/conversations/${conversationId}`, {
    method: "DELETE",
  });
}
