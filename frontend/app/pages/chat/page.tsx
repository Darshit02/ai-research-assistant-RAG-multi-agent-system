"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import {
  setSessions,
  addSession,
  removeSession,
  setActiveSession,
  updateSessionTitle,
  updateSessionSettings,
  setMessages,
  appendMessage,
} from "@/features/chat/chatSlice";
import { setDocuments, toggleSelectedDoc } from "@/features/documents/documentsSlice";
import { sessionsApi } from "@/shared/api/sessions";
import { documentsApi, Document } from "@/shared/api/documents";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { ChatMessageBubble } from "@/shared/components/ChatMessageBubble";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import { authApi } from "@/shared/api/auth";
import { toast } from "sonner";
import { Send, Plus, MessageSquare, Trash2, Library, CheckSquare, Square, Bot, Eye, Settings2, Sparkles, Globe, Loader2, CircleFadingPlus } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";

function ChatPage() {
  const dispatch = useDispatch();
  const { sessions, activeSessionId, messages } = useSelector((state: RootState) => state.chat);
  const { list: documents, selectedIds } = useSelector((state: RootState) => state.documents);
  const [input, setInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const docIdParam = searchParams.get("docId");

  // States for renaming
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // States for Model & Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // States for PDF viewer
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [viewingPage, setViewingPage] = useState<number>(1);

  // Initial Load
  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch messages when active session changes
  useEffect(() => {
    if (activeSessionId && !messages[activeSessionId]) {
      fetchMessages(activeSessionId);
    }
  }, [activeSessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSessionId, isAsking]);

  // Handle docId from query param once documents are loaded
  useEffect(() => {
    if (docIdParam && documents.length > 0) {
      if (!selectedIds.includes(docIdParam)) {
        dispatch(toggleSelectedDoc(docIdParam));
      }
    }
  }, [docIdParam, documents.length]);

  const loadInitialData = async () => {
    try {
      const [sessRes, docsRes, userRes] = await Promise.all([
        sessionsApi.getAll(),
        documentsApi.getAll(),
        authApi.getMe()
      ]);

      dispatch(setSessions(sessRes.data));
      dispatch(setDocuments(docsRes.data));

      if (sessRes.data.length > 0 && !activeSessionId) {
        dispatch(setActiveSession(sessRes.data[0].session_id));
      }

      // Handle docId from query param
      if (docIdParam) {
        // We need to wait for documents to be loaded which they are now
        // If not already selected, select it
        if (!selectedIds.includes(docIdParam)) {
          dispatch(toggleSelectedDoc(docIdParam));
        }
      }
    } catch (error) {
      toast.error("Failed to load session data");
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await sessionsApi.getMessages(sessionId);
      dispatch(setMessages({ sessionId, messages: res.data }));
    } catch (error) {
      console.error("Failed to fetch messages");
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await sessionsApi.create();
      const newSess = {
        session_id: res.data.session_id,
        created_at: new Date().toISOString(),
        title: res.data.title || "New Chat"
      };
      dispatch(addSession(newSess));
      dispatch(setActiveSession(newSess.session_id));
    } catch (error) {
      toast.error("Failed to create new chat");
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await sessionsApi.delete(sessionId);
      dispatch(removeSession(sessionId));
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  const startRenaming = (e: React.MouseEvent, sess: any) => {
    e.stopPropagation();
    setEditingSessionId(sess.session_id);
    setEditTitle(sess.title || `Chat ${sess.session_id.substring(0, 8)}`);
  };

  const handleRename = async () => {
    if (!editingSessionId || !editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }

    try {
      await sessionsApi.updateTitle(editingSessionId, editTitle);
      dispatch(updateSessionTitle({ sessionId: editingSessionId, title: editTitle }));
    } catch (error) {
      toast.error("Failed to rename chat");
    } finally {
      setEditingSessionId(null);
    }
  };

  const handleSessionSettingUpdate = async (sessionId: string, settings: { model_name?: string; language?: string }) => {
    try {
      await sessionsApi.updateSettings(sessionId, settings);
      dispatch(updateSessionSettings({ sessionId, ...settings }));
      toast.success("Chat settings updated");
    } catch (error) {
      toast.error("Failed to update chat settings");
    }
  };

  const handleCitationClick = (citation: any) => {
    const doc = documents.find(d => d.id === citation.document_id);
    if (doc) {
      setViewingDoc(doc);
      setViewingPage(citation.page);
    } else {
      toast.error("Source document no longer available");
    }
  };

  const activeSession = sessions.find(s => s.session_id === activeSessionId);
  const currentModel = activeSession?.model_name || "gemini-2.5-flash";
  const currentLanguage = activeSession?.language || "English";

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId) return;

    const question = input.trim();
    setInput("");
    dispatch(appendMessage({
      sessionId: activeSessionId,
      message: { role: "user", content: question, created_at: new Date().toISOString() }
    }));

    setIsAsking(true);

    try {
      const res = await sessionsApi.ask(question, activeSessionId, selectedIds);

      if (res.data.error) {
        dispatch(appendMessage({
          sessionId: activeSessionId,
          message: {
            role: (res.data as any).role === "error" ? "error" : "assistant",
            content: res.data.error,
            created_at: new Date().toISOString()
          }
        }));
        toast.error(res.data.error);
        return;
      }
      // Use pre-formatted answer from backend, or fallback to defensive formatting if needed
      let formattedContent = (res.data as any).answer || "";

      if (!formattedContent.trim()) {
        if (res.data.summary?.trim()) formattedContent += `### Summary\n${res.data.summary.trim()}\n\n`;
        if (res.data.key_findings?.trim()) formattedContent += `### Key Findings\n${res.data.key_findings.trim()}\n\n`;
        if (res.data.evidence?.trim()) formattedContent += `### Evidence\n${res.data.evidence.trim()}\n\n`;
        if (res.data.conclusion?.trim()) formattedContent += `### Conclusion\n${res.data.conclusion.trim()}`;
      }

      if (!formattedContent.trim()) {
        formattedContent = (res.data as any).message || "No relevant information found.";
      }

      dispatch(appendMessage({
        sessionId: activeSessionId,
        message: {
          role: "assistant",
          content: formattedContent,
          created_at: new Date().toISOString(),
          citations: res.data.citations
        }
      }));

      // Refresh sessions to see if title was auto-generated
      const sessRes = await sessionsApi.getAll();
      dispatch(setSessions(sessRes.data));

    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to get response");
    } finally {
      setIsAsking(false);
    }
  };

  const activeMessages = activeSessionId ? messages[activeSessionId] || [] : [];
  const readyDocs = documents.filter(d => d.status === "ready");

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      <AppSidebar />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-border bg-muted/30 hidden md:flex flex-col">
          <div className="px-4 py-3 border-b text-white  border-border">
            <Button onClick={handleCreateSession} className="w-full cursor-pointer gap-2 font-medium rounded-md h-10">
              <CircleFadingPlus size={20} />
              <span className="text-md ">
                New Chat
              </span>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <h3 className="text-[12px] font-bold text-muted-foreground capitalize tracking-widest mb-3 px-2 mt-2">
              Recent Activity
            </h3>
            {sessions.length === 0 ? (
              <p className="text-sm text-balance text-muted-foreground px-2 text-center py-6 leading-relaxed">No conversations found.</p>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.session_id}
                  onClick={() => dispatch(setActiveSession(sess.session_id))}
                  onDoubleClick={(e) => startRenaming(e, sess)}
                  className={`group flex items-center justify-between px-3 py-3 rounded-md  cursor-pointer transition-all duration-200 border ${activeSessionId === sess.session_id
                    ? "bg-primary/10 text-primary font-semibold border-primary/20"
                    : "text-foreground hover:bg-muted"
                    }`}
                >
                  <div className="flex items-center gap-3 truncate flex-1">
                    {activeSessionId === sess.session_id ? (
                      <span className="text-primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 10V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H14" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M19.5 7C20.8807 7 22 5.88071 22 4.5C22 3.11929 20.8807 2 19.5 2C18.1193 2 17 3.11929 17 4.5C17 5.88071 18.1193 7 19.5 7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M15.9965 11H16.0054" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M11.9955 11H12.0045" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M7.99451 11H8.00349" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M15.9965 11H16.0054" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M11.9955 11H12.0045" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M7.99451 11H8.00349" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </span>
                    )}
                    {editingSessionId === sess.session_id ? (
                      <Input
                        autoFocus
                        className="h-7 py-1 px-2 text-sm bg-background border-primary focus-visible:ring-1 focus-visible:ring-primary"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate text-sm tracking-tight">
                        {sess.title || `Chat ${sess.session_id.substring(0, 8)}`}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(e, sess.session_id)}
                    className=" cursor-pointer p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="h-[40%] border-t border-border bg-background/50 p-4 flex flex-col">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.5 18V7C3.5 3 4.5 2 8.5 2H15.5C19.5 2 20.5 3 20.5 7V17C20.5 17.14 20.5 17.28 20.49 17.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M6.35 15H20.5V18.5C20.5 20.43 18.93 22 17 22H7C5.07 22 3.5 20.43 3.5 18.5V17.85C3.5 16.28 4.78 15 6.35 15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M8 7H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M8 10.5H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <h3 className="text-[12px] font-bold text-muted-foreground capitalize tracking-widest px-2">
                Source Knowledge
              </h3>
            </h3>
            <Separator className="my-2" />
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {readyDocs.length === 0 ? (
                <div className="text-center py-6 bg-muted/20 rounded-md border border-dashed border-border">
                  <p className="text-[11px] text-muted-foreground">Go to dashboard to upload documents</p>
                </div>
              ) : (
                readyDocs.map(doc => {
                  const isSelected = selectedIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      className={`group flex items-center gap-2 p-2.5 rounded-md cursor-pointer text-sm transition-all duration-200 border ${isSelected
                        ? "bg-primary/5 text-primary border-primary/20"
                        : "hover:bg-muted border-transparent text-muted-foreground"
                        }`}
                    >
                      <div
                        className="flex items-center gap-2 flex-1 truncate"
                        onClick={() => dispatch(toggleSelectedDoc(doc.id))}
                      >
                        {isSelected ? <CheckSquare size={15} className="shrink-0" /> : <Square size={15} className="shrink-0 opacity-40 hover:opacity-100" />}
                        <span className="truncate font-medium flex-1" title={doc.filename}>{doc.filename}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDoc(doc);
                          setViewingPage(1);
                        }}
                        className="p-1.5 cursor-pointer hover:bg-primary/10 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        title="View PDF"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative">

          {/* Header */}
          <header className="h-16 border-b border-border flex items-center px-8 bg-background/90 backdrop-blur-md z-10 sticky top-0 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.47 16.83L18.86 19.99C18.96 20.82 18.07 21.4 17.36 20.97L13.17 18.48C12.71 18.48 12.26 18.45 11.82 18.39C12.56 17.52 13 16.42 13 15.23C13 12.39 10.54 10.09 7.49997 10.09C6.33997 10.09 5.26997 10.42 4.37997 11C4.34997 10.75 4.33997 10.5 4.33997 10.24C4.33997 5.68999 8.28997 2 13.17 2C18.05 2 22 5.68999 22 10.24C22 12.94 20.61 15.33 18.47 16.83Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M13 15.23C13 16.42 12.56 17.5201 11.82 18.3901C10.83 19.5901 9.26 20.36 7.5 20.36L4.89 21.91C4.45 22.18 3.89 21.81 3.95 21.3L4.2 19.3301C2.86 18.4001 2 16.91 2 15.23C2 13.47 2.94 11.9201 4.38 11.0001C5.27 10.4201 6.34 10.0901 7.5 10.0901C10.54 10.0901 13 12.39 13 15.23Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight">
                  {activeSessionId ? (sessions.find(s => s.session_id === activeSessionId)?.title || `Session ${activeSessionId.substring(0, 8)}`) : "AI Research Hub"}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {selectedIds.length === 0 ? "General Search" : `${selectedIds.length} Source Documents Active`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Per-Chat Settings Dialog */}
              {activeSessionId && (
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-9 px-4 gap-2 rounded-md border-border bg-muted/30 hover:bg-muted/50 cursor-pointer">
                      <Settings2 size={16} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Intelligence Settings</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] border-border shadow-2xl">
                    <DialogHeader className="">
                      <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                        Chat Intelligence
                      </DialogTitle>
                    </DialogHeader>

                    <Separator />
                    <div className="grid gap-8 py-2">
                      {/* Model Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 ml-1">
                          <Sparkles size={14} className="text-primary" />
                          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">AI Powerhouse Model</label>
                        </div>
                        <Select
                          value={currentModel}
                          onValueChange={(val) => handleSessionSettingUpdate(activeSessionId, { model_name: val })}
                        >
                          <SelectTrigger className="w-full h-10 rounded-md border-border bg-muted/20 focus:ring-2 focus:ring-primary/20 hover:bg-muted/30 transition-all text-sm font-medium">
                            <SelectValue placeholder="Select Model" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-border">
                            <SelectItem value="gemini-2.5-flash" className="rounded-xl">Gemini 2.5 Flash</SelectItem>
                            <SelectItem value="gemini-2.5-pro" className="rounded-xl">Gemini 2.5 Pro</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground leading-relaxed ml-1">Settings apply only to this specific conversation. Switch models anytime to compare results.</p>
                      </div>

                      {/* Language Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 ml-1">
                          <Globe size={14} className="text-primary" />
                          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Linguistic Response Tone</label>
                        </div>
                        <Select
                          value={currentLanguage}
                          onValueChange={(val) => handleSessionSettingUpdate(activeSessionId, { language: val })}
                        >
                          <SelectTrigger className="w-full h-10 rounded-md border-border bg-muted/20 focus:ring-0 hover:bg-muted/30 transition-all text-sm font-medium">
                            <SelectValue placeholder="Select Language" />
                          </SelectTrigger>
                          <SelectContent className="rounded-md px-2 py-2 border-border">
                            <SelectItem value="English" className="rounded-md">English (Default)</SelectItem>
                            <SelectItem value="Spanish" className="rounded-md">Español (Spanish)</SelectItem>
                            <SelectItem value="French" className="rounded-md">Français (French)</SelectItem>
                            <SelectItem value="German" className="rounded-md">Deutsch (German)</SelectItem>
                            <SelectItem value="Chinese" className="rounded-md">中文 (Chinese)</SelectItem>
                            <SelectItem value="Japanese" className="rounded-md">日本語 (Japanese)</SelectItem>
                            <SelectItem value="Hindi" className="rounded-xl">हिन्दी (Hindi)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter className="mt-8 border-t border-border/10 pt-4">
                      <Button
                        onClick={() => setIsSettingsOpen(false)}
                        className="w-full h-10 rounded-md font-black capitalize cursor-pointer tracking-widest text-xs"
                      >
                        Acknowledge & Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {activeSessionId && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/20">
                  <Sparkles size={12} className="text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">{currentModel.split('-')[0].toUpperCase()} ACTIVE</span>
                </div>
              )}
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-linear-to-b from-background to-muted/10">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">

              {!activeSessionId ? (
                <div className="flex-1 flex flex-col items-center justify-center mt-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-20 h-20 bg-muted/50 rounded-[2rem] flex items-center justify-center mb-8 border border-border shadow-2xl shadow-muted/20">
                    <MessageSquare size={36} className="text-muted-foreground/60" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-3">Your AI Knowledge Partner</h2>
                  <p className="text-muted-foreground text-sm max-w-[320px] leading-relaxed font-medium">
                    Pick a conversation or start a new deep-dive into your uploaded research documents.
                  </p>
                </div>
              ) : activeMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center mt-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-8 text-primary shadow-2xl shadow-primary/10 border border-primary/20">
                    <Bot size={40} />
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-4">What's the goal for today?</h2>
                  <p className="text-muted-foreground text-base max-w-[440px] leading-relaxed">
                    Select your research sources from the left panel and I'll analyze them to give you high-quality, cited answers.
                  </p>
                </div>
              ) : (
                <>
                  {activeMessages.map((msg, idx) => (
                    <ChatMessageBubble
                      key={idx}
                      role={msg.role as "user" | "assistant"}
                      content={msg.content}
                      citations={msg.citations}
                      onCitationClick={handleCitationClick}
                    />
                  ))}
                  {isAsking && (
                    <ChatMessageBubble role="assistant" content="" isStreaming={true} />
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </>
              )}
            </div>
          </div>

          {/* Input Area */}
          {activeSessionId && (
            <div className=" ">
              <div className="flex px-12 py-3 gap-2 justify-center items-center w-full">
                <div className=" w-5/6 group">
                  <Input
                    className=" py-6 bg-muted/40 focus:ring-none  rounded-full pl-10 text-base placeholder:text-muted-foreground/40"
                    placeholder={selectedIds.length > 0 ? `Query against ${selectedIds.length} source(s)...` : "Start a general AI inquiry..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isAsking}
                  />
                </div>
                <Button
                  size="icon"
                  className="h-12 w-12 shrink-0 bg-primary hover:bg-primary/90 transition-all duration-200 active:scale-90 disabled:opacity-50 rounded-full cursor-pointer"
                  onClick={handleSend}
                  disabled={isAsking || !input.trim()}
                >
                  <Send size={20} />
                </Button>
              </div>
              <div className="text-center my-2 flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
                  Encrypted Research Environment
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
                  Advanced Model active
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* PDF Viewer Sheet */}
      <Sheet open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <SheetContent side="right" className="m:max-w-4xl p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/50">
          {viewingDoc && (
            <>
              <SheetHeader className="p-6 border-b border-border bg-background/50 backdrop-blur-md">
                <SheetTitle className="flex items-center gap-3 text-lg font-bold truncate pr-8">
                  <div className="flex flex-col truncate">
                    <span className="truncate">{viewingDoc.filename}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Page {viewingPage} active preview</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 bg-muted/20 relative">
                <iframe
                  src={`http://localhost:8000/pdf/${viewingDoc.filename}#page=${viewingPage}`}
                  className="w-full h-full border-none shadow-inner"
                  title="PDF Viewer"
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function SuspendedChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <ChatPage />
    </Suspense>
  );
}
