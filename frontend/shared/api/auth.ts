import api from "./axios";

export const authApi = {
  register: (email: string, password: string) =>
    api.post("/auth/register", { email, password }),

  login: (email: string, password: string) =>
    api.post<{ access_token: string; token_type: string }>("/auth/login/json", {
      email,
      password,
    }),

  getMe: () =>
    api.get<{ 
      id: string; 
      email: string; 
      role: string;
      preferred_model?: string;
      gemini_api_key?: string;
      openai_api_key?: string;
      anthropic_api_key?: string;
    }>("/auth/user/me"),

  updateSettings: (settings: { 
    preferred_model?: string; 
    api_key?: string;
    gemini_api_key?: string;
    openai_api_key?: string;
    anthropic_api_key?: string;
  }) => api.put("/auth/user/settings", settings),

  logout: () => api.post("/auth/logout"),
};
