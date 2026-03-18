"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { AnalyticsCard } from "@/shared/components/AnalyticsCard";
import { DocumentUploadCard } from "@/shared/components/DocumentUploadCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { documentsApi, Analytics } from "@/shared/api/documents";
import { setDocuments, removeDocument, setUploading } from "@/features/documents/documentsSlice";
import { RootState } from "@/app/provider/store";
import { FileText, MessageSquare, ListTodo, Trash2, Calendar, LucideProps, CircleFadingPlus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { list: documents, uploading } = useSelector((state: RootState) => state.documents);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsRes, docsRes] = await Promise.all([
        documentsApi.getAnalytics(),
        documentsApi.getAll()
      ]);
      setAnalytics(analyticsRes.data);
      dispatch(setDocuments(docsRes.data));
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    dispatch(setUploading(true));
    try {
      await documentsApi.upload(file);
      toast.success("Document uploaded successfully. Processing started.");
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Upload failed");
    } finally {
      dispatch(setUploading(false));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentsApi.delete(id);
      dispatch(removeDocument(id));
      await loadData();
      toast.success("Document deleted");
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-[fade-in_0.5s_ease-out]">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Overview of your research and interactions.
              </p>
            </div>
            <a href="/pages/chat" className="inline-flex gap-2 h-10 items-center justify-center rounded-md border-1 border-dashed border-primary px-6 text-sm font-medium text-primary">
            <CircleFadingPlus className="" size={20}/>
              Start Chat
            </a>
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
                icon={(props: LucideProps) => 
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    {...props}
                  >
                    <path
                      d="M17.98 10.79V14.79C17.98 15.05 17.97 15.3 17.94 15.54C17.71 18.24 16.12 19.58 13.19 19.58H12.79C12.54 19.58 12.3 19.7 12.15 19.9L10.95 21.5C10.42 22.21 9.56 22.21 9.03 21.5L7.82999 19.9C7.69999 19.73 7.41 19.58 7.19 19.58H6.79001C3.60001 19.58 2 18.79 2 14.79V10.79C2 7.86001 3.35001 6.27001 6.04001 6.04001C6.28001 6.01001 6.53001 6 6.79001 6H13.19C16.38 6 17.98 7.60001 17.98 10.79Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21.98 6.79001V10.79C21.98 13.73 20.63 15.31 17.94 15.54C17.97 15.3 17.98 15.05 17.98 14.79V10.79C17.98 7.60001 16.38 6 13.19 6H6.79004C6.53004 6 6.28004 6.01001 6.04004 6.04001C6.27004 3.35001 7.86004 2 10.79 2H17.19C20.38 2 21.98 3.60001 21.98 6.79001Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.4955 13.25H13.5045"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.9955 13.25H10.0045"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.4955 13.25H6.5045"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>}
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

          <div className="mt-12 space-y-8">
            <DocumentUploadCard onUpload={handleUpload} isUploading={uploading} />

            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Your Library
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary/30 rounded-lg animate-pulse" />)}
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl border-border bg-secondary/10">
                  <p className="text-muted-foreground">No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="glass-card rounded-xl overflow-hidden border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase">
                      <tr>
                        <th className="px-6 py-4 font-medium">Filename</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium"><div className="flex items-center gap-1"><Calendar size={14} /> Uploaded</div></th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 font-medium truncate max-w-[300px]" title={doc.filename}>
                            {doc.filename}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={doc.status} />
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {format(new Date(doc.uploaded_at), "MMM d, yyyy HH:mm")}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                              title="Delete document"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
