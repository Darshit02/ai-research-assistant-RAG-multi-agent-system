"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { DocumentUploadCard } from "@/shared/components/DocumentUploadCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { documentsApi } from "@/shared/api/documents";
import { setDocuments, addDocument, removeDocument, setUploading } from "@/features/documents/documentsSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import { toast } from "sonner";
import { Trash2, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function DocumentsPage() {
  const dispatch = useDispatch();
  const { list: documents, uploading } = useSelector((state: RootState) => state.documents);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await documentsApi.getAll();
      dispatch(setDocuments(res.data));
    } catch (error) {
      toast.error("Failed to load documents");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    dispatch(setUploading(true));
    try {
      await documentsApi.upload(file);
      toast.success("Document uploaded successfully. Processing started.");
      // Refresh the list to get the new document with its status
      await loadDocuments();
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
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Documents</h1>
            <p className="text-muted-foreground">
              Manage your PDFs. Upload new files to include them in your RAG context.
            </p>
          </div>

          <DocumentUploadCard onUpload={handleUpload} isUploading={uploading} />

          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Your Library
            </h2>

            {initialLoading ? (
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
                      <th className="px-6 py-4 font-medium"><div className="flex items-center gap-1"><Calendar size={14}/> Uploaded</div></th>
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
  );
}
