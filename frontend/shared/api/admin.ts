import api from "./axios";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface AdminDocument {
  id: string;
  filename: string;
  user_id: string;
}

export interface AdminAnalytics {
  users: number;
  documents: number;
  sessions: number;
  messages: number;
  tokens_used: number;
}

export interface SystemPerformance {
  cpu_usage_percent: number;
  memory_usage_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  disk_usage_percent: number;
}

export const adminApi = {
  getUsers: () => api.get<AdminUser[]>("/admin/users"),

  getDocuments: () => api.get<AdminDocument[]>("/admin/documents"),

  getAnalytics: () => api.get<AdminAnalytics>("/admin/analytics"),

  getDailyUsage: () => api.get<Record<string, number>>("/admin/analytics/daily"),

  getActiveUsers: () =>
    api.get<{ active_users_24h: number }>("/admin/analytics/active-users"),

  getSystemPerformance: () =>
    api.get<SystemPerformance>("/admin/system/performance"),

  getSystemInfo: () =>
    api.get<{ status: string; version: string }>("/admin/system"),
};
