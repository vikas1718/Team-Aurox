import { 
  Mic2, 
  Image, 
  Video, 
  FileEdit, 
  Sparkles, 
  Scale,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut: string;
  color: string;
}

const actions: QuickAction[] = [
  { icon: Mic2, label: "Voice", shortcut: "⌘V", color: "from-green-500 to-emerald-600" },
  { icon: Image, label: "Image", shortcut: "⌘I", color: "from-purple-500 to-violet-600" },
  { icon: Video, label: "Video", shortcut: "⌘D", color: "from-red-500 to-rose-600" },
  { icon: FileEdit, label: "Edit", shortcut: "⌘E", color: "from-blue-500 to-cyan-600" },
  { icon: Sparkles, label: "Enhance", shortcut: "⌘H", color: "from-amber-500 to-orange-600" },
  { icon: Scale, label: "Upscale", shortcut: "⌘U", color: "from-pink-500 to-fuchsia-600" },
];

export const QuickActions = () => {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.label}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all group",
              "opacity-0 animate-scale-in",
              `stagger-${index + 1}`
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
              action.color,
              "group-hover:scale-110 transition-transform"
            )}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {action.shortcut}
            </kbd>
          </button>
        ))}
      </div>
    </div>
  );
};
