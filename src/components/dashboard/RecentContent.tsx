import { Clock, MoreVertical, Eye, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  title: string;
  type: "article" | "video" | "audio" | "social";
  status: "live" | "scheduled" | "draft";
  platforms: string[];
  publishedAt?: string;
  scheduledFor?: string;
  views?: number;
}

const mockContent: ContentItem[] = [
  {
    id: "1",
    title: "Breaking: Global Summit Reaches Historic Climate Agreement",
    type: "article",
    status: "live",
    platforms: ["Web", "App", "Social"],
    publishedAt: "2 hours ago",
    views: 15420
  },
  {
    id: "2",
    title: "Tech Giants Report Q4 Earnings - Analysis",
    type: "video",
    status: "scheduled",
    platforms: ["Web", "Radio", "Podcast"],
    scheduledFor: "Tomorrow, 9:00 AM"
  },
  {
    id: "3",
    title: "Local Elections Update: Key Races to Watch",
    type: "article",
    status: "draft",
    platforms: ["Print", "e-Paper"],
  },
  {
    id: "4",
    title: "Sports Roundup: Weekend Highlights",
    type: "audio",
    status: "live",
    platforms: ["Radio", "Podcast", "App"],
    publishedAt: "5 hours ago",
    views: 8750
  },
];

const typeColors = {
  article: "bg-blue-500/20 text-blue-400",
  video: "bg-purple-500/20 text-purple-400",
  audio: "bg-green-500/20 text-green-400",
  social: "bg-pink-500/20 text-pink-400",
};

export const RecentContent = () => {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground">Recent Content</h2>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="space-y-4">
        {mockContent.map((item, index) => (
          <div 
            key={item.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group",
              "opacity-0 animate-slide-up",
              `stagger-${index + 1}`
            )}
          >
            {/* Type Badge */}
            <div className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize", typeColors[item.type])}>
              {item.type}
            </div>

            {/* Content Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {item.publishedAt || item.scheduledFor}
                </div>
                {item.views && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {item.views.toLocaleString()} views
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <span className={cn(
              "status-badge",
              item.status === "live" && "status-live",
              item.status === "scheduled" && "status-scheduled",
              item.status === "draft" && "status-draft"
            )}>
              {item.status}
            </span>

            {/* Platforms */}
            <div className="hidden lg:flex items-center gap-2">
              {item.platforms.slice(0, 3).map((platform) => (
                <span key={platform} className="platform-chip">
                  {platform}
                </span>
              ))}
              {item.platforms.length > 3 && (
                <span className="text-xs text-muted-foreground">+{item.platforms.length - 3}</span>
              )}
            </div>

            {/* Actions */}
            <button className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
