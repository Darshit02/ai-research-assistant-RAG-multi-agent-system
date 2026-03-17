"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { AnalyticsCard } from "@/shared/components/AnalyticsCard";
import { adminApi, AdminAnalytics, AdminUser, AdminDocument, SystemPerformance } from "@/shared/api/admin";
import { useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import { useRouter } from "next/navigation";
import { Users, FileStack, Cpu, Database, Server, Activity, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [docs, setDocs] = useState<AdminDocument[]>([]);
  const [perf, setPerf] = useState<SystemPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "docs">("overview");

  useEffect(() => {
    // Basic redirect if not admin
    if (user && user.role !== "admin") {
      router.push("/pages/dashboard");
      return;
    }

    if (user?.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      const [analyticsRes, usersRes, docsRes, perfRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getUsers(),
        adminApi.getDocuments(),
        adminApi.getSystemPerformance()
      ]);

      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setDocs(docsRes.data);
      setPerf(perfRes.data);
    } catch (error) {
      console.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-[fade-in_0.5s_ease-out]">
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <AlertTriangle size={28} className="text-destructive" />
                Admin Console
              </h1>
              <p className="text-muted-foreground">
                Platform-wide analytics, user management, and system health.
              </p>
            </div>
            {perf && (
              <div className="flex items-center gap-4 bg-secondary/30 px-4 py-2 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${perf.cpu_usage_percent > 80 ? "bg-destructive animate-pulse" : "bg-emerald-500"}`} />
                  <span className="text-sm font-medium">System Online</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-b border-border mb-6">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Users ({users.length})
            </button>
            <button 
              onClick={() => setActiveTab("docs")}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "docs" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Documents ({docs.length})
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-[120px] bg-secondary/30 rounded-xl animate-pulse" />)}
              </div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && analytics && perf && (
                <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
                  <h3 className="text-lg font-semibold">Platform Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <AnalyticsCard title="Total Users" value={analytics.users} icon={Users} />
                    <AnalyticsCard title="Total Docs" value={analytics.documents} icon={FileStack} />
                    <AnalyticsCard title="Total Tokens" value={analytics.tokens_used.toLocaleString()} icon={Activity} />
                    <AnalyticsCard title="Chat Sessions" value={analytics.sessions} icon={Database} />
                  </div>

                  <h3 className="text-lg font-semibold mt-10">System Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card rounded-xl p-6 border border-border relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-secondary/30">
                        <div className={`h-full ${perf.cpu_usage_percent > 80 ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${perf.cpu_usage_percent}%` }} />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <Cpu className="text-primary" />
                        <h4 className="font-medium">CPU Usage</h4>
                      </div>
                      <p className="text-3xl font-bold">{perf.cpu_usage_percent}%</p>
                    </div>

                    <div className="glass-card rounded-xl p-6 border border-border relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-secondary/30">
                        <div className={`h-full ${perf.memory_usage_percent > 80 ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${perf.memory_usage_percent}%` }} />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <Server className="text-primary" />
                        <h4 className="font-medium">Memory Usage</h4>
                      </div>
                      <p className="text-3xl font-bold">{perf.memory_usage_percent}%</p>
                      <p className="text-sm text-muted-foreground mt-1">{perf.memory_used_mb}MB / {perf.memory_total_mb}MB</p>
                    </div>

                    <div className="glass-card rounded-xl p-6 border border-border relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-secondary/30">
                        <div className={`h-full ${perf.disk_usage_percent > 80 ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${perf.disk_usage_percent}%` }} />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <Database className="text-primary" />
                        <h4 className="font-medium">Disk Usage</h4>
                      </div>
                      <p className="text-3xl font-bold">{perf.disk_usage_percent}%</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="glass-card rounded-xl overflow-hidden border border-border animate-[fade-in_0.3s_ease-out]">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase">
                      <tr>
                        <th className="px-6 py-4 font-medium">User ID</th>
                        <th className="px-6 py-4 font-medium">Email</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs">{u.id}</td>
                          <td className="px-6 py-4 font-medium">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "docs" && (
                <div className="glass-card rounded-xl overflow-hidden border border-border animate-[fade-in_0.3s_ease-out]">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase">
                      <tr>
                        <th className="px-6 py-4 font-medium">Doc ID</th>
                        <th className="px-6 py-4 font-medium">Filename</th>
                        <th className="px-6 py-4 font-medium">Owner ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {docs.map((d) => (
                        <tr key={d.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs">{d.id}</td>
                          <td className="px-6 py-4 font-medium">{d.filename}</td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{d.user_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
