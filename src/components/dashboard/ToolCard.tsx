import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor?: string;
  onClick?: () => void;
  className?: string;
}

export const ToolCard = ({ 
  icon: Icon, 
  title, 
  description, 
  accentColor = "primary",
  onClick,
  className 
}: ToolCardProps) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "tool-card text-left group w-full",
        className
      )}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
      
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
          "bg-primary/10 group-hover:bg-primary/20"
        )}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
      
      <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </button>
  );
};
