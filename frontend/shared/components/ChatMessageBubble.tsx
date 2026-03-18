"use client";

import { User, Sparkles, Copy, CheckCircle2, Bookmark, AlertCircle } from "lucide-react";
import { useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Citation {
  document_id: string;
  page: number;
  text: string;
}

interface ChatMessageBubbleProps {
  role: "user" | "assistant" | "error";
  content: string;
  isStreaming?: boolean;
  citations?: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

export function ChatMessageBubble({ 
  role, 
  content, 
  isStreaming, 
  citations = [], 
  onCitationClick 
}: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === "user";
  const isError = role === "error";

  return (
    <div className={`flex w-full mb-8 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border ${
              isUser
                ? "bg-muted text-muted-foreground border-border"
                : isError
                ? "bg-destructive text-destructive-foreground border-destructive/20 shadow-md shadow-destructive/10"
                : "bg-primary text-primary-foreground border-primary/20 shadow-md shadow-primary/10"
            }`}
          >
            {isUser ? <User size={18} /> : isError ? <AlertCircle size={18} /> : <Sparkles size={18} />}
          </div>
        </div>

        {/* Message Bubble Base */}
        <div className="flex flex-col group min-w-0 flex-1">
          <div
            className={`relative rounded-2xl px-6 py-5 shadow-sm border transition-all duration-300 ${
              isUser
                ? "bg-muted/30 border-border/60 text-foreground rounded-tr-sm hover:bg-muted/50"
                : isError
                ? "bg-destructive/10 border-destructive/30 text-destructive rounded-tl-sm shadow-sm"
                : "bg-card border-border text-foreground rounded-tl-sm glass-card border-l-primary/40 shadow-sm"
            }`}
          >
            {/* The Markdown Content */}
            <div className={`prose prose-sm dark:prose-invert max-w-none text-[15px] leading-[1.65] font-normal ${isUser ? "text-foreground/90" : "text-foreground"}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2.5 h-5 ml-1 bg-primary animate-pulse align-middle rounded-sm" />
              )}
            </div>

            {/* Citations List */}
            {!isUser && citations.length > 0 && !isStreaming && (
              <div className="mt-8 pt-5 border-t border-border/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Documented Evidence</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {citations.map((cite, i) => (
                    <button
                      key={i}
                      onClick={() => onCitationClick?.(cite)}
                      className="flex items-center gap-2 px-3 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl border border-primary/10 transition-all text-xs font-bold group/cite hover:scale-[1.02] active:scale-[0.98] shadow-xs"
                    >
                      <Bookmark size={11} className="text-primary/60 group-hover/cite:text-primary transition-colors" />
                      <span>Page {cite.page}</span>
                      <span className="w-1 h-1 rounded-full bg-primary/20 mx-0.5" />
                      <span className="opacity-50 font-medium truncate max-w-[120px]">{cite.document_id.substring(0,8)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions (only for AI) */}
            {!isUser && !isStreaming && (
              <div className="absolute -bottom-11 left-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 pt-2 translate-y-1 group-hover:translate-y-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground hover:text-primary bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border transition-all hover:border-primary/30 shadow-sm"
                >
                  {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  {copied ? "COPIED" : "COPY TRANSCRIPT"}
                </button>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
