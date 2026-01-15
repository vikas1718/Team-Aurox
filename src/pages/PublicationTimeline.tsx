import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Radio,
  Smartphone,
  Newspaper,
  Share2,
  Headphones,
  Monitor,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduledContent {
  id: string;
  title: string;
  description: string;
  platform: string;
  platformIcon: React.ComponentType<{ className?: string }>;
  color: string;
  time: string;
  date: string;
  status: "scheduled" | "published" | "draft";
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Web: Globe,
  Radio: Radio,
  App: Smartphone,
  Print: Newspaper,
  Social: Share2,
  Podcast: Headphones,
  "e-Paper": Monitor,
  All: Globe,
};

const platformColors: Record<string, string> = {
  Web: "bg-blue-500",
  Radio: "bg-green-500",
  App: "bg-cyan-500",
  Print: "bg-orange-500",
  Social: "bg-pink-500",
  Podcast: "bg-amber-500",
  "e-Paper": "bg-purple-500",
  All: "bg-primary",
};

const initialScheduledContent: ScheduledContent[] = [
  { id: "1", title: "Morning Brief", description: "Daily morning news roundup", platform: "Radio", platformIcon: Radio, color: "bg-green-500", time: "08:00", date: "2026-01-15", status: "published" },
  { id: "2", title: "Market Open Report", description: "Stock market opening analysis", platform: "Web", platformIcon: Globe, color: "bg-blue-500", time: "09:00", date: "2026-01-15", status: "published" },
  { id: "3", title: "Daily Digest", description: "Comprehensive news digest", platform: "e-Paper", platformIcon: Monitor, color: "bg-purple-500", time: "09:30", date: "2026-01-15", status: "scheduled" },
  { id: "4", title: "Breaking: Policy Update", description: "Government policy announcement", platform: "All", platformIcon: Globe, color: "bg-primary", time: "11:00", date: "2026-01-15", status: "scheduled" },
  { id: "5", title: "Noon Update", description: "Midday news summary", platform: "App", platformIcon: Smartphone, color: "bg-cyan-500", time: "12:00", date: "2026-01-15", status: "scheduled" },
  { id: "6", title: "Deep Dive Analysis", description: "In-depth analysis podcast", platform: "Podcast", platformIcon: Headphones, color: "bg-amber-500", time: "14:00", date: "2026-01-15", status: "draft" },
  { id: "7", title: "Evening Social Posts", description: "Social media engagement content", platform: "Social", platformIcon: Share2, color: "bg-pink-500", time: "18:00", date: "2026-01-15", status: "scheduled" },
  { id: "8", title: "Print Edition", description: "Tomorrow's print edition", platform: "Print", platformIcon: Newspaper, color: "bg-orange-500", time: "22:00", date: "2026-01-15", status: "draft" },
  { id: "9", title: "Tech Review", description: "Weekly technology review", platform: "Web", platformIcon: Globe, color: "bg-blue-500", time: "10:00", date: "2026-01-16", status: "scheduled" },
  { id: "10", title: "Weekend Preview", description: "Events preview for the weekend", platform: "App", platformIcon: Smartphone, color: "bg-cyan-500", time: "15:00", date: "2026-01-17", status: "draft" },
];

const hours = Array.from({ length: 16 }, (_, i) => `${(i + 6).toString().padStart(2, "0")}:00`);

const getDaysOfWeek = (startDate: Date) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }
  return days;
};

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

const formatDisplayDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
};

export const PublicationTimeline = () => {
  const [view, setView] = useState<"week" | "day" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 15));
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>(initialScheduledContent);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isNewContentOpen, setIsNewContentOpen] = useState(false);
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    platform: "Web",
    date: "2026-01-15",
    time: "09:00",
  });

  const daysOfWeek = getDaysOfWeek(currentDate);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const getContentForSlot = (date: string, hour: string) => {
    return scheduledContent.filter(
      (content) =>
        content.date === date &&
        content.time.startsWith(hour.split(":")[0]) &&
        (selectedPlatforms.length === 0 || selectedPlatforms.includes(content.platform))
    );
  };

  const togglePlatformFilter = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleAddContent = () => {
    const newItem: ScheduledContent = {
      id: Date.now().toString(),
      title: newContent.title,
      description: newContent.description,
      platform: newContent.platform,
      platformIcon: platformIcons[newContent.platform],
      color: platformColors[newContent.platform],
      time: newContent.time,
      date: newContent.date,
      status: "draft",
    };
    setScheduledContent([...scheduledContent, newItem]);
    setNewContent({ title: "", description: "", platform: "Web", date: "2026-01-15", time: "09:00" });
    setIsNewContentOpen(false);
  };

  const deleteContent = (id: string) => {
    setScheduledContent(scheduledContent.filter((c) => c.id !== id));
  };

  const platforms = Object.keys(platformIcons);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Publication Timeline" 
        subtitle="Schedule and manage content across all platforms"
      />

      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-secondary rounded-lg p-1">
              {(["day", "week", "month"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize",
                    view === v
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {daysOfWeek[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                  {daysOfWeek[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(2026, 0, 15))}>
                Today
              </Button>
            </div>
          </div>

          <Dialog open={isNewContentOpen} onOpenChange={setIsNewContentOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Schedule Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Content</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                  <Input
                    placeholder="Content title..."
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                  <Textarea
                    placeholder="Brief description..."
                    value={newContent.description}
                    onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Platform</label>
                    <Select value={newContent.platform} onValueChange={(v) => setNewContent({ ...newContent, platform: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                    <Select value={newContent.time} onValueChange={(v) => setNewContent({ ...newContent, time: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={newContent.date}
                    onChange={(e) => setNewContent({ ...newContent, date: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleAddContent} disabled={!newContent.title}>
                  Schedule Content
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Platform Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>
          {platforms.map((platform) => {
            const Icon = platformIcons[platform];
            const isActive = selectedPlatforms.includes(platform);
            return (
              <button
                key={platform}
                onClick={() => togglePlatformFilter(platform)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {platform}
              </button>
            );
          })}
          {selectedPlatforms.length > 0 && (
            <button
              onClick={() => setSelectedPlatforms([])}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="card-elevated overflow-hidden">
          {/* Header with days */}
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-4 bg-secondary/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            {daysOfWeek.map((day, index) => {
              const isToday = formatDate(day) === "2026-01-15";
              return (
                <div
                  key={index}
                  className={cn(
                    "p-4 text-center border-l border-border",
                    isToday && "bg-primary/10"
                  )}
                >
                  <p className={cn(
                    "text-sm font-medium",
                    isToday ? "text-primary" : "text-foreground"
                  )}>
                    {formatDisplayDate(day)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {day.toLocaleDateString("en-US", { month: "short" })}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          <div className="max-h-[600px] overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                <div className="p-3 bg-secondary/30 text-xs font-medium text-muted-foreground flex items-start justify-center">
                  {hour}
                </div>
                {daysOfWeek.map((day, dayIndex) => {
                  const dateStr = formatDate(day);
                  const isToday = dateStr === "2026-01-15";
                  const content = getContentForSlot(dateStr, hour);
                  
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "min-h-[80px] p-2 border-l border-border",
                        isToday && "bg-primary/5"
                      )}
                    >
                      {content.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "group relative p-2 rounded-lg mb-1 cursor-pointer transition-all hover:scale-[1.02]",
                            item.status === "published" && "opacity-60",
                            "bg-card border border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", item.color)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <item.platformIcon className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{item.platform}</span>
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full ml-auto",
                                  item.status === "published" && "bg-green-500/20 text-green-500",
                                  item.status === "scheduled" && "bg-blue-500/20 text-blue-500",
                                  item.status === "draft" && "bg-muted text-muted-foreground"
                                )}>
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Hover actions */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button className="p-1 rounded hover:bg-muted" title="Edit">
                              <Edit2 className="w-3 h-3 text-muted-foreground" />
                            </button>
                            <button className="p-1 rounded hover:bg-muted" title="Duplicate">
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            </button>
                            <button 
                              className="p-1 rounded hover:bg-destructive/20" 
                              title="Delete"
                              onClick={() => deleteContent(item.id)}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-elevated p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Status Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500" />
                <span className="text-sm text-muted-foreground">Published</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500" />
                <span className="text-sm text-muted-foreground">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted border border-muted-foreground" />
                <span className="text-sm text-muted-foreground">Draft</span>
              </div>
            </div>
          </div>

          <div className="card-elevated p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">This Week</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {scheduledContent.filter(c => c.status === "scheduled").length}
                </p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {scheduledContent.filter(c => c.status === "published").length}
                </p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">
                  {scheduledContent.filter(c => c.status === "draft").length}
                </p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Platform Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {platforms.slice(0, 6).map((platform) => {
                const count = scheduledContent.filter(c => c.platform === platform).length;
                if (count === 0) return null;
                return (
                  <div key={platform} className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-full">
                    <span className={cn("w-2 h-2 rounded-full", platformColors[platform])} />
                    <span className="text-xs text-muted-foreground">{platform}</span>
                    <span className="text-xs font-medium text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
