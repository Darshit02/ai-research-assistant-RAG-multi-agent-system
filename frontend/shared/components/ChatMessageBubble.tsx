"use client";

import { User, Sparkles, Copy, CheckCircle2, Bookmark, AlertCircle, UserCircle } from "lucide-react";
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

  const formatContent = (text: string) => {
    if (!text) return "";
    let formatted = text;

    // Fix for compressed content: Identify section headers and ensure they are Markdown headers
    const sections = ["Summary", "Key Findings", "Evidence", "Conclusion", "Next Steps", "Analysis"];
    sections.forEach((section) => {
      // Matches section names followed by a colon, either at start, after newline, or after ". "
      const regex = new RegExp(`(^|\\n|\\.\\s+)(${section}):`, "g");
      formatted = formatted.replace(regex, (match, prefix, name) => {
        const cleanPrefix = prefix.trim() ? `${prefix}\n\n` : "";
        return `${cleanPrefix}### ${name}\n`;
      });
    });

    // Ensure double newlines for bullet points if they are tightly packed
    formatted = formatted.replace(/([^\n])\n(-|\*)\s/g, "$1\n\n$2 ");

    return formatted;
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center border ${isUser
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
            className={`relative rounded-md px-3 py-3 border transition-all duration-500 ${isUser
              ? "bg-muted/40 text-foreground rounded-tr-sm hover:bg-muted/60"
              : isError
                ? "bg-destructive/10 border-destructive/30 text-destructive "
                : "bg-white/70 dark:bg-card/40 border-border text-foreground "
              }`}
          >
            {/* The Markdown Content */}
            <div className={`prose prose-sm cursor-pointer dark:prose-invert max-w-none text-[15px] leading-[1.7] font-normal ${isUser ? "text-foreground/90" : "text-foreground"}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {formatContent(content)}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle rounded-full" />
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
                      <span className="opacity-50 font-medium truncate max-w-[120px]">{cite.document_id.substring(0, 8)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions (only for AI) */}
            {!isUser && !isStreaming && (
              <div className="absolute  -bottom-11 left-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 pt-2 translate-y-1 group-hover:translate-y-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center cursor-pointer gap-2 text-[10px] font-black tracking-widest text-muted-foreground hover:text-primary bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border transition-all hover:border-primary/30 shadow-sm"
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
