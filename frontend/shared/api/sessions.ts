import api from "./axios";

export interface Session {
  session_id: string;
  created_at: string;
  title?: string;
  language?: string;
  model_name?: string;
}

export interface Citation {
  document_id: string;
  page: number;
  text: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
  created_at: string;
  citations?: Citation[];
}

export interface AskResponse {
  summary: string;
  key_findings: string;
  evidence: string;
  comparison: string;
  conclusion: string;
  citations: Citation[];
  error?: string;
}

export const sessionsApi = {
  create: () =>
    api.post<{ session_id: string; language: string; title: string }>("/documents/sessions"),

  getAll: () => api.get<Session[]>("/documents/get-all-sessions"),

  delete: (sessionId: string) =>
    api.delete(`/documents/sessions/${sessionId}`),

  getMessages: (sessionId: string) =>
    api.get<ChatMessage[]>(`/documents/messages/${sessionId}`),

  updateTitle: (sessionId: string, title: string) =>
    api.put(`/documents/sessions/${sessionId}/title`, null, {
      params: { title },
    }),

  ask: (question: string, sessionId: string, documentIds: string[]) => {
    // FastAPI expects list query params as repeated keys: ?document_ids=a&document_ids=b
    const params = new URLSearchParams({
      question,
      session_id: sessionId,
    });
    documentIds.forEach((id) => params.append("document_ids", id));
    return api.post<AskResponse>(`/documents/ask?${params.toString()}`);
  },

  changeLanguage: (sessionId: string, language: string) =>
    api.put(`/documents/sessions/${sessionId}/language`, null, {
      params: { language },
    }),

  updateSettings: (sessionId: string, settings: { language?: string; model_name?: string }) =>
    api.put(`/documents/sessions/${sessionId}/settings`, settings),
};
