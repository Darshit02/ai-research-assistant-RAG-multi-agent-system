"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import {
  setSessions,
  addSession,
  removeSession,
  setActiveSession,
  setMessages,
  appendMessage,
} from "@/features/chat/chatSlice";
import { setDocuments, toggleSelectedDoc } from "@/features/documents/documentsSlice";
import { sessionsApi } from "@/shared/api/sessions";
import { documentsApi } from "@/shared/api/documents";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { ChatMessageBubble } from "@/shared/components/ChatMessageBubble";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { Send, Plus, MessageSquare, Trash2, Library, CheckSquare, Square, Bot } from "lucide-react";

export default function ChatPage() {
  const dispatch = useDispatch();
  const { sessions, activeSessionId, messages } = useSelector((state: RootState) => state.chat);
  const { list: documents, selectedIds } = useSelector((state: RootState) => state.documents);
  const [input, setInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const loadInitialData = async () => {
    try {
      const [sessRes, docsRes] = await Promise.all([
        sessionsApi.getAll(),
        documentsApi.getAll()
      ]);
      
      dispatch(setSessions(sessRes.data));
      dispatch(setDocuments(docsRes.data));
      
      if (sessRes.data.length > 0 && !activeSessionId) {
        dispatch(setActiveSession(sessRes.data[0].session_id));
      }
    } catch (error) {
      toast.error("Failed to load chat data");
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
      // Ensure we shape it to match Session interface (API returns id, state expecting session_id)
      const newSess = { session_id: res.data.session_id, created_at: new Date().toISOString() };
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

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId) return;

    const question = input.trim();
    setInput("");
    
    // Optimistically add user message
    dispatch(appendMessage({
      sessionId: activeSessionId,
      message: { role: "user", content: question, created_at: new Date().toISOString() }
    }));

    setIsAsking(true);
    
    try {
      // Backend actually takes 'document_ids' up to max required, send active selections
      const res = await sessionsApi.ask(question, activeSessionId, selectedIds);
      
      dispatch(appendMessage({
        sessionId: activeSessionId,
        message: { role: "assistant", content: res.data.answer, created_at: new Date().toISOString() }
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to get response");
      // Could remove optimistic user message here on failure
    } finally {
      setIsAsking(false);
    }
  };

  const activeMessages = activeSessionId ? messages[activeSessionId] || [] : [];
  const readyDocs = documents.filter(d => d.status === "ready");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      
      {/* Chat Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sub-Sidebar (Sessions & Docs) */}
        <div className="w-72 border-r border-border bg-secondary/10 hidden md:flex flex-col">
          
          {/* New Chat Button */}
          <div className="p-4 border-b border-border text-center">
            <Button onClick={handleCreateSession} className="w-full gap-2 shadow-sm font-medium">
              <Plus size={16} /> New Chat
            </Button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 mt-2">
              Recent Chats
            </h3>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 text-center py-4">No chats yet</p>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.session_id}
                  onClick={() => dispatch(setActiveSession(sess.session_id))}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    activeSessionId === sess.session_id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare size={16} className={activeSessionId === sess.session_id ? "opacity-100" : "opacity-50"} />
                    <span className="truncate text-sm">
                      Chat {sess.session_id.substring(0, 8)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(e, sess.session_id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Document Context Selector */}
          <div className="h-1/3 border-t border-border bg-background/50 p-4 flex flex-col">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Library size={14} />
              RAG Context (Docs)
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
              {readyDocs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No ready documents.</p>
              ) : (
                readyDocs.map(doc => {
                  const isSelected = selectedIds.includes(doc.id);
                  return (
                    <div 
                      key={doc.id}
                      onClick={() => dispatch(toggleSelectedDoc(doc.id))}
                      className={`flex items-start gap-2 p-2 rounded-md cursor-pointer text-sm transition-colors ${
                        isSelected ? "bg-primary/5 text-primary" : "hover:bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isSelected ? <CheckSquare size={16} className="mt-0.5 shrink-0" /> : <Square size={16} className="mt-0.5 shrink-0 opacity-50" />}
                      <span className="truncate" title={doc.filename}>{doc.filename}</span>
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
          <header className="h-14 border-b border-border flex items-center px-6 bg-background/80 backdrop-blur-sm z-10 sticky top-0">
             <div className="flex items-center gap-3">
               <Bot className="text-primary" size={20} />
               <span className="font-semibold text-sm">
                 {activeSessionId ? `Session ${activeSessionId.substring(0,8)}` : "Select a Chat"}
               </span>
               <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/50 border border-border">
                 {selectedIds.length} docs selected
               </span>
             </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-3xl mx-auto flex flex-col">
              
              {!activeSessionId ? (
                <div className="flex-1 flex flex-col items-center justify-center mt-32 text-center animate-[fade-in_0.5s_ease-out]">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                    <MessageSquare size={32} className="text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No Chat Selected</h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Select a chat from the sidebar or click "New Chat" to begin asking questions.
                  </p>
                </div>
              ) : activeMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center mt-32 text-center animate-[fade-in_0.5s_ease-out]">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary shadow-lg shadow-primary/20">
                    <Bot size={32} />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-2">How can I help you today?</h2>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Select some documents from the bottom left and ask a question. I will search through them and provide an answer.
                  </p>
                </div>
              ) : (
                <>
                  {activeMessages.map((msg, idx) => (
                    <ChatMessageBubble 
                      key={idx} 
                      role={msg.role as "user" | "assistant"} 
                      content={msg.content} 
                    />
                  ))}
                  {isAsking && (
                    <ChatMessageBubble role="assistant" content="" isStreaming={true} />
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Input Area */}
          {activeSessionId && (
            <div className="border-t border-border bg-background p-4">
              <div className="max-w-3xl mx-auto relative group">
                <Input
                  className="pr-14 pl-4 py-6 bg-secondary/30 border-border/50 focus-visible:ring-primary shadow-sm rounded-xl text-base placeholder:text-muted-foreground/50 transition-all"
                  placeholder={selectedIds.length > 0 ? `Ask a question about ${selectedIds.length} document(s)...` : "Ask a general question..."}
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
                <Button 
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50"
                  onClick={handleSend}
                  disabled={isAsking || !input.trim()}
                >
                  <Send size={18} />
                </Button>
              </div>
              <div className="text-center mt-3">
                <span className="text-[11px] text-muted-foreground">
                  AI responses may contain inaccuracies. Verify important information.
                </span>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
