import api from "./axios";

export interface Session {
  session_id: string;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AskResponse {
  answer: string;
  sources?: string[];
}

export const sessionsApi = {
  create: () =>
    api.post<{ session_id: string; language: string }>("/documents/sessions"),

  getAll: () => api.get<Session[]>("/documents/get-all-sessions"),

  delete: (sessionId: string) =>
    api.delete(`/documents/sessions/${sessionId}`),

  getMessages: (sessionId: string) =>
    api.get<ChatMessage[]>(`/documents/messages/${sessionId}`),

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
};
