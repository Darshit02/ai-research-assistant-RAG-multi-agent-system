import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "processing" | "ready" | "error" | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status.toLowerCase()) {
    case "processing":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
          <Loader2 size={12} className="animate-spin" />
          Processing
        </span>
      );
    case "ready":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
          <CheckCircle2 size={12} />
          Ready
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-full border border-destructive/20">
          <XCircle size={12} />
          Error
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full border border-border">
          {status}
        </span>
      );
  }
}
