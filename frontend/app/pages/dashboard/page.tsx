"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { AnalyticsCard } from "@/shared/components/AnalyticsCard";
import { documentsApi, Analytics } from "@/shared/api/documents";
import { FileText, MessageSquare, ListTodo } from "lucide-react";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await documentsApi.getAnalytics();
        setAnalytics(res.data);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-[fade-in_0.5s_ease-out]">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your research and interactions.
            </p>
          </div>

          {!loading && analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnalyticsCard
                title="Total Documents"
                value={analytics.documents}
                icon={FileText}
                description="Uploaded PDFs"
              />
              <AnalyticsCard
                title="Chat Sessions"
                value={analytics.chat_sessions}
                icon={MessageSquare}
                description="Active conversations"
              />
              <AnalyticsCard
                title="Messages Exchanged"
                value={analytics.messages}
                icon={ListTodo}
                description="Total Q&A interactions"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-6 h-[140px] animate-pulse bg-secondary/20" />
              ))}
            </div>
          )}

          <div className="mt-12 glass-card rounded-xl p-8 border border-border">
             <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
             <p className="text-muted-foreground mb-6">Build your knowledge base to get started with the AI Assistant.</p>
             <div className="flex gap-4">
               <a href="/pages/documents" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                 Upload Document
               </a>
               <a href="/pages/chat" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                 Start Chat
               </a>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
