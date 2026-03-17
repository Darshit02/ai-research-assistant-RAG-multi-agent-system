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
    api.get<{ id: string; email: string; created_at: string; role: string }>("/auth/user/me"),
};
