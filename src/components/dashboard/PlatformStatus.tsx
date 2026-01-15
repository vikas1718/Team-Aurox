import { 
  Globe, 
  Smartphone, 
  Radio, 
  Headphones, 
  Newspaper, 
  FileText, 
  Share2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "online" | "syncing" | "offline";
  lastSync: string;
  contentCount: number;
}

const platforms: Platform[] = [
  { id: "web", name: "Web Portal", icon: Globe, status: "online", lastSync: "Just now", contentCount: 248 },
  { id: "app", name: "Mobile App", icon: Smartphone, status: "online", lastSync: "2 min ago", contentCount: 245 },
  { id: "radio", name: "Radio", icon: Radio, status: "online", lastSync: "5 min ago", contentCount: 42 },
  { id: "podcast", name: "Podcast", icon: Headphones, status: "syncing", lastSync: "Syncing...", contentCount: 38 },
  { id: "print", name: "Print", icon: Newspaper, status: "online", lastSync: "1 hour ago", contentCount: 12 },
  { id: "epaper", name: "e-Paper", icon: FileText, status: "online", lastSync: "30 min ago", contentCount: 24 },
  { id: "social", name: "Social Media", icon: Share2, status: "online", lastSync: "Just now", contentCount: 156 },
];

export const PlatformStatus = () => {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground">Platform Status</h2>
        <button className="text-sm text-primary hover:underline">Manage</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {platforms.map((platform, index) => (
          <div 
            key={platform.id}
            className={cn(
              "p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group",
              "opacity-0 animate-scale-in",
              `stagger-${Math.min(index + 1, 6)}`
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <platform.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              {platform.status === "online" && (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              )}
              {platform.status === "syncing" && (
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              )}
              {platform.status === "offline" && (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground">{platform.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{platform.lastSync}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{platform.contentCount} items</p>
          </div>
        ))}
      </div>
    </div>
  );
};
