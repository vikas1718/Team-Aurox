import { useState } from "react";
import { 
  Share2, 
  Globe, 
  Smartphone, 
  Radio, 
  Headphones, 
  Newspaper, 
  FileText,
  Check,
  ChevronRight,
  Settings,
  Eye,
  Send
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "ready" | "needs-adaptation" | "disabled";
  preview?: string;
}

const platforms: Platform[] = [
  { id: "web", name: "Web Portal", icon: Globe, status: "ready", preview: "Full article with multimedia" },
  { id: "app", name: "Mobile App", icon: Smartphone, status: "ready", preview: "Push notification + summary" },
  { id: "radio", name: "Radio", icon: Radio, status: "needs-adaptation", preview: "60-second audio script" },
  { id: "podcast", name: "Podcast", icon: Headphones, status: "needs-adaptation", preview: "5-minute deep dive" },
  { id: "print", name: "Print Edition", icon: Newspaper, status: "ready", preview: "Column format, 400 words" },
  { id: "epaper", name: "e-Paper", icon: FileText, status: "ready", preview: "Digital print replica" },
  { id: "social", name: "Social Media", icon: Share2, status: "ready", preview: "Thread + image" },
];

export const MultiPlatform = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["web", "app", "social"]);
  const [contentTitle, setContentTitle] = useState("");

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen">
      <Header title="Multi-Platform Publishing" subtitle="One source, multiple outputs across all channels" />
      
      <main className="p-6 space-y-6">
        {/* Content Source */}
        <div className="card-elevated p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Content Source</h3>
          <input
            type="text"
            value={contentTitle}
            onChange={(e) => setContentTitle(e.target.value)}
            placeholder="Enter article title or paste content..."
            className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-dashed border-border">
            <p className="text-sm text-muted-foreground text-center">
              Drop a file here or click to upload your source content
            </p>
          </div>
        </div>

        {/* Platform Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Select Platforms</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedPlatforms(platforms.map(p => p.id))}
              >
                Select All
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedPlatforms([])}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform, index) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={cn(
                    "tool-card text-left group relative",
                    isSelected && "border-primary/50",
                    "opacity-0 animate-slide-up",
                    `stagger-${Math.min(index + 1, 6)}`
                  )}
                >
                  {/* Selection indicator */}
                  <div className={cn(
                    "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary/20" : "bg-secondary"
                    )}>
                      <platform.icon className={cn(
                        "w-6 h-6",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{platform.name}</p>
                      <p className="text-sm text-muted-foreground">{platform.preview}</p>
                      {platform.status === "needs-adaptation" && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-2">
                          <Settings className="w-3 h-3" />
                          Needs adaptation
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="card-elevated p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-foreground font-medium">
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""} selected
              </p>
              <p className="text-sm text-muted-foreground">
                Content will be adapted for each platform automatically
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview All
              </Button>
              <Button 
                className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground"
                disabled={selectedPlatforms.length === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? "s" : ""}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
