import { useState, useEffect } from "react";
import {
  Share2, Globe, Smartphone, Radio, Headphones,
  Newspaper, FileText, Check, ChevronRight,
  Settings, Eye, Send, RefreshCw, CheckCircle2, X
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";



interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "ready" | "needs-adaptation";
  preview: string;
}

const platforms: Platform[] = [
  { id: "web",     name: "Web Portal",    icon: Globe,       status: "ready",            preview: "Full article with multimedia"    },
  { id: "app",     name: "Mobile App",    icon: Smartphone,  status: "ready",            preview: "Push notification + summary"     },
  { id: "radio",   name: "Radio",         icon: Radio,       status: "needs-adaptation", preview: "60-second audio script"          },
  { id: "podcast", name: "Podcast",       icon: Headphones,  status: "needs-adaptation", preview: "5-minute deep dive"              },
  { id: "print",   name: "Print Edition", icon: Newspaper,   status: "ready",            preview: "Column format, 400 words"        },
  { id: "epaper",  name: "e-Paper",       icon: FileText,    status: "ready",            preview: "Digital print replica"           },
  { id: "social",  name: "Social Media",  icon: Share2,      status: "ready",            preview: "Thread + image"                  },
];

// per-platform publishing status type
type PlatformStatus = "idle" | "publishing" | "done" | "error";

export const MultiPlatform = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["web", "app", "social"]);
  const [contentTitle,      setContentTitle]      = useState("");
  const [contentBody,       setContentBody]       = useState("");
  const [isPublishing,      setIsPublishing]      = useState(false);
  const [platformStatus,    setPlatformStatus]    = useState<Record<string, PlatformStatus>>({});
  const [publishSuccess,    setPublishSuccess]    = useState(false);
  const [publishError,      setPublishError]      = useState<string | null>(null);
  const [userId,            setUserId]            = useState<string | null>(null);
  const [showPreview,       setShowPreview]       = useState(false);
  const [publishedId,       setPublishedId]       = useState<string | null>(null);

  // ── Auto sign-in ─────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { setUserId(session.user.id); return; }
      const { data } = await supabase.auth.signInAnonymously();
      if (data?.user) setUserId(data.user.id);
    };
    init();
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // ── Publish Handler ───────────────────────────────────────────
  const handlePublish = async () => {
    if (!contentTitle.trim()) {
      setPublishError("Please enter a content title before publishing.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setPublishError("Please select at least one platform.");
      return;
    }

    setPublishError(null);
    setPublishSuccess(false);
    setIsPublishing(true);

    // Set all selected platforms to "publishing"
    const initial: Record<string, PlatformStatus> = {};
    selectedPlatforms.forEach((id) => { initial[id] = "publishing"; });
    setPlatformStatus(initial);

    try {
      // Save publication to Supabase
      const { data, error: dbError } = await supabase
        .from("publications")
        .insert({
          user_id:    userId,
          title:      contentTitle,
          content:    contentBody || contentTitle,
          platforms:  selectedPlatforms,
          status:     "published",
        })
        .select("id")
        .single();

      if (dbError) throw new Error(dbError.message);

      setPublishedId(data?.id ?? null);

      // Simulate platform-by-platform publishing with stagger
      for (const id of selectedPlatforms) {
        await new Promise((res) => setTimeout(res, 400));
        setPlatformStatus((prev) => ({ ...prev, [id]: "done" }));
      }

      setPublishSuccess(true);

    } catch (err) {
      // Mark all as error
      const errState: Record<string, PlatformStatus> = {};
      selectedPlatforms.forEach((id) => { errState[id] = "error"; });
      setPlatformStatus(errState);
      setPublishError(err instanceof Error ? err.message : "Publishing failed.");
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────
  const handleReset = () => {
    setContentTitle("");
    setContentBody("");
    setSelectedPlatforms(["web", "app", "social"]);
    setPlatformStatus({});
    setPublishSuccess(false);
    setPublishError(null);
    setPublishedId(null);
  };

  const allDone = selectedPlatforms.every((id) => platformStatus[id] === "done");

  return (
    <div className="min-h-screen">
      <Header
        title="Multi-Platform Publishing"
        subtitle="One source, multiple outputs across all channels"
      />

      <main className="p-6 space-y-6">

        {/* ── Success Banner ── */}
        {publishSuccess && (
          <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-base">Successfully Published! 🎉</p>
              <p className="text-sm mt-1 text-green-300">
                Your content <span className="font-medium">"{contentTitle}"</span> has been
                published to <span className="font-medium">{selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""}</span> and saved to your database.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Button
                  size="sm"
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Preview
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-400 hover:text-green-300"
                  onClick={handleReset}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Publish New Content
                </Button>
              </div>
            </div>
            <button onClick={() => setPublishSuccess(false)} className="text-green-400 hover:text-green-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── Error Banner ── */}
        {publishError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            ⚠️ {publishError}
            <button onClick={() => setPublishError(null)} className="ml-auto hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Content Source ── */}
        <div className="card-elevated p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Content Source</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              placeholder="Enter article title..."
              className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <textarea
              value={contentBody}
              onChange={(e) => setContentBody(e.target.value)}
              placeholder="Type or paste your full article content here..."
              className="w-full h-40 p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
            />
            <p className="text-xs text-muted-foreground">
              {contentBody.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
        </div>

        {/* ── Platform Selection ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Select Platforms</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPlatforms(platforms.map((p) => p.id))}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPlatforms([])}>
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform, index) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              const pStatus    = platformStatus[platform.id];
              return (
                <button
                  key={platform.id}
                  onClick={() => !isPublishing && togglePlatform(platform.id)}
                  disabled={isPublishing}
                  className={cn(
                    "tool-card text-left group relative transition-all",
                    isSelected && "border-primary/50",
                    pStatus === "done"  && "border-green-500/50 bg-green-500/5",
                    pStatus === "error" && "border-red-500/50 bg-red-500/5",
                    "opacity-0 animate-slide-up",
                    `stagger-${Math.min(index + 1, 6)}`
                  )}
                >
                  {/* Status indicator */}
                  <div className={cn(
                    "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    pStatus === "publishing" && "border-primary bg-primary/20",
                    pStatus === "done"       && "border-green-500 bg-green-500",
                    pStatus === "error"      && "border-red-500 bg-red-500",
                    !pStatus && isSelected   && "border-primary bg-primary",
                    !pStatus && !isSelected  && "border-muted-foreground/30",
                  )}>
                    {pStatus === "publishing" && <RefreshCw className="w-3 h-3 text-primary animate-spin" />}
                    {pStatus === "done"       && <Check className="w-4 h-4 text-white" />}
                    {pStatus === "error"      && <X className="w-3 h-3 text-white" />}
                    {!pStatus && isSelected   && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      pStatus === "done"  ? "bg-green-500/20" :
                      pStatus === "error" ? "bg-red-500/20"   :
                      isSelected          ? "bg-primary/20"   : "bg-secondary"
                    )}>
                      <platform.icon className={cn(
                        "w-6 h-6",
                        pStatus === "done"  ? "text-green-400" :
                        pStatus === "error" ? "text-red-400"   :
                        isSelected          ? "text-primary"   : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{platform.name}</p>
                      <p className="text-sm text-muted-foreground">{platform.preview}</p>
                      {platform.status === "needs-adaptation" && !pStatus && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-2">
                          <Settings className="w-3 h-3" />
                          Needs adaptation
                        </span>
                      )}
                      {pStatus === "publishing" && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary mt-2">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Publishing...
                        </span>
                      )}
                      {pStatus === "done" && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400 mt-2">
                          <CheckCircle2 className="w-3 h-3" />
                          Published
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Actions ── */}
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
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={!contentTitle.trim()}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview All
              </Button>
              <Button
                className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground disabled:opacity-60"
                disabled={selectedPlatforms.length === 0 || isPublishing || !contentTitle.trim()}
                onClick={handlePublish}
              >
                {isPublishing ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Publishing...</>
                ) : allDone ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" />Published!</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? "s" : ""}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

      </main>

      {/* ── Preview Modal ── */}
      {showPreview && (
        <PreviewModal
          title={contentTitle}
          content={contentBody}
          platforms={selectedPlatforms}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

// ── Preview Modal Component ────────────────────────────────────
const PreviewModal = ({
  title, content, platforms: selectedIds, onClose
}: {
  title: string;
  content: string;
  platforms: string[];
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState(selectedIds[0] || "web");

  const selectedPlatformList = platforms.filter((p) => selectedIds.includes(p.id));
  const activePlatform = platforms.find((p) => p.id === activeTab);

  // Generate a preview text based on platform
  const getPreviewContent = (platformId: string) => {
    const base = content || title || "No content provided.";
    switch (platformId) {
      case "web":
        return `📰 Web Article\n\n${title}\n\n${base}\n\nRead more on our web portal with multimedia support.`;
      case "app":
        return `📱 Push Notification\n\n🔔 Breaking: ${title}\n\nTap to read the full story...`;
      case "radio":
        return `🎙️ Radio Script (60s)\n\nGood evening, I'm your host. ${title}. ${base.slice(0, 120)}... Stay tuned for more updates.`;
      case "podcast":
        return `🎧 Podcast Deep Dive (5 min)\n\nWelcome back. Today we're covering: ${title}.\n\n${base}\n\nThat's all for today's episode. Subscribe for more.`;
      case "print":
        return `🗞️ Print Edition\n\n${title.toUpperCase()}\n\n${base.slice(0, 400)}`;
      case "epaper":
        return `📄 e-Paper Edition\n\n${title}\n\n${base}\n\n[Digital replica — formatted for e-ink display]`;
      case "social":
        return `📲 Social Media Thread\n\n🧵 BREAKING: ${title}\n\n${base.slice(0, 200)}...\n\n#News #Breaking #Update`;
      default:
        return base;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Preview All Platforms</h2>
            <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-md">{title || "No title yet"}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-1 p-3 border-b border-border overflow-x-auto">
          {selectedPlatformList.length > 0 ? selectedPlatformList.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setActiveTab(platform.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeTab === platform.id
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <platform.icon className="w-4 h-4" />
              {platform.name}
            </button>
          )) : (
            <p className="text-sm text-muted-foreground px-3 py-2">No platforms selected</p>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-5">
          {activePlatform ? (
            <div className="space-y-4">
              {/* Platform info bar */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <activePlatform.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{activePlatform.name}</p>
                  <p className="text-xs text-muted-foreground">{activePlatform.preview}</p>
                </div>
                {activePlatform.status === "needs-adaptation" && (
                  <span className="ml-auto text-xs text-amber-400 flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Needs adaptation
                  </span>
                )}
              </div>

              {/* Content preview */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border min-h-48">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {getPreviewContent(activeTab)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">Select a platform tab to preview</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Previewing {selectedPlatformList.length} platform{selectedPlatformList.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={onClose} variant="outline" size="sm">
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
};