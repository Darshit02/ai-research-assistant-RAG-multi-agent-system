import api from "./axios";

export interface Document {
  id: string;
  filename: string;
  status: "processing" | "ready" | "error";
  uploaded_at: string;
}

export interface Analytics {
  documents: number;
  chat_sessions: number;
  messages: number;
}

export interface Usage {
  requests: number;
  tokens_used: number;
}

export const documentsApi = {
  getAll: () => api.get<Document[]>("/documents/"),

  getById: (id: string) =>
    api.get<Document & { filepath: string }>(`/documents/${id}`),

  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<{ message: string; filename: string; expires_at: string }>(
      "/documents/upload",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  delete: (id: string) => api.delete(`/documents/${id}`),

  search: (query: string) =>
    api.get<Document[]>("/documents/search", { params: { query } }),

  getAnalytics: () => api.get<Analytics>("/documents/analytics"),

  getUsage: () => api.get<Usage>("/documents/usage"),

  updateSettings: (model: string, apiKey: string) =>
    api.put("/documents/settings", null, {
      params: { model, api_key: apiKey },
    }),

  highlight: (documentId: string, page: number) =>
    api.get("/documents/highlight", { params: { document_id: documentId, page } }),
};
