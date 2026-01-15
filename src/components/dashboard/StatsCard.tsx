import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
}

export const StatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "neutral",
  className 
}: StatsCardProps) => {
  return (
    <div className={cn("tool-card", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {change && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            changeType === "positive" && "bg-green-500/20 text-green-400",
            changeType === "negative" && "bg-red-500/20 text-red-400",
            changeType === "neutral" && "bg-muted text-muted-foreground"
          )}>
            {change}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      <p className="font-display text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
};
