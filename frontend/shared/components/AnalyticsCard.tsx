import { LucideIcon, LucideProps } from "lucide-react";
import { ComponentType } from "react";


interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon | ComponentType<LucideProps>;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export function AnalyticsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: AnalyticsCardProps) {
  return (
    <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
      {/* Decorative gradient orb */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-3xl font-bold tracking-tight mb-1">{value}</h3>
        
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                trend.isUp
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {trend.isUp ? "+" : "-"}{trend.value}%
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      </div>
    </div>
  );
}
