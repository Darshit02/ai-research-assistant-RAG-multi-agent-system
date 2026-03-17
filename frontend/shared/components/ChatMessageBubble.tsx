"use client";

import { User, Sparkles, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
// Would normally import ReactMarkdown here, assuming simple text for now
// import ReactMarkdown from "react-markdown";

interface ChatMessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessageBubble({ role, content, isStreaming }: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === "user";

  return (
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
              isUser
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {isUser ? <User size={16} /> : <Sparkles size={16} />}
          </div>
        </div>

        {/* Message Bubble Base */}
        <div className="flex flex-col group min-w-0">
          <span className={`text-xs text-muted-foreground/80 mb-1 ${isUser ? "text-right" : "text-left"}`}>
            {isUser ? "You" : "AI Assistant"}
          </span>
          
          <div
            className={`relative rounded-2xl px-5 py-4 shadow-sm border ${
              isUser
                ? "bg-secondary/50 border-secondary-foreground/10 text-secondary-foreground rounded-tr-sm"
                : "bg-card border-border text-foreground rounded-tl-sm glass-card"
            }`}
          >
            {/* The actual markdown content */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed whitespace-pre-wrap">
              {content}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
              )}
            </div>

            {/* Quick Actions (only for AI) */}
            {!isUser && !isStreaming && (
              <div className="absolute -bottom-10 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 pt-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-secondary/50 px-2 py-1 rounded-md transition-colors"
                >
                  {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
