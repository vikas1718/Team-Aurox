// src/pages/ChiefDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, XCircle, AlertCircle, Clock, LogOut,
  RefreshCw, MessageSquare, User, FileText, Send, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";


type Status = "pending" | "approved" | "revision" | "rejected";

interface Article {
  id: string;
  title: string;
  content: string;
  status: Status;
  feedback: string | null;
  submitted_at: string;
  reviewed_at:  string | null;
  reporter_id:  string;
  reporter_name?: string;
}

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending:  { label: "Pending",        color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: Clock        },
  approved: { label: "Approved",       color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",   icon: CheckCircle2 },
  revision: { label: "Needs Revision", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", icon: AlertCircle  },
  rejected: { label: "Rejected",       color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",       icon: XCircle      },
};

export const ChiefDashboard = () => {
  const navigate   = useNavigate();
  const [articles,    setArticles]    = useState<Article[]>([]);
  const [profile,     setProfile]     = useState<{ full_name: string; team_key: string } | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [feedback,    setFeedback]    = useState("");
  const [isUpdating,  setIsUpdating]  = useState(false);
  const [successMsg,  setSuccessMsg]  = useState<string | null>(null);
  const [filter,      setFilter]      = useState<Status | "all">("all");

  // ── Load data ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data: prof } = await supabase
        .from("user_profiles")
        .select("full_name, team_key, role")
        .eq("id", session.user.id)
        .single();

      if (!prof || prof.role !== "chief_reporter") { navigate("/login"); return; }
      setProfile(prof);

      // Load articles for this team
      const { data: arts } = await supabase
        .from("articles")
        .select("*")
        .eq("team_key", prof.team_key)
        .order("submitted_at", { ascending: false });

      if (!arts) { setIsLoading(false); return; }

      // Get reporter names
      const reporterIds = [...new Set(arts.map(a => a.reporter_id))];
      const { data: reporters } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .in("id", reporterIds);

      const nameMap = Object.fromEntries((reporters || []).map(r => [r.id, r.full_name]));
      setArticles(arts.map(a => ({ ...a, reporter_name: nameMap[a.reporter_id] || "Unknown" })));
      setIsLoading(false);
    };
    load();
  }, [navigate]);

  // ── Update article status ─────────────────────────────────────
  const updateArticle = async (id: string, status: Status, feedbackText?: string) => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from("articles")
        .update({
          status,
          feedback:    feedbackText || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: session!.user.id,
        })
        .eq("id", id);

      if (error) throw error;

      setArticles(prev => prev.map(a =>
        a.id === id
          ? { ...a, status, feedback: feedbackText || null, reviewed_at: new Date().toISOString() }
          : a
      ));

      setSuccessMsg(`Article ${status === "approved" ? "approved" : status === "revision" ? "sent for revision" : "rejected"}!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setActiveId(null);
      setFeedback("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const filtered = filter === "all" ? articles : articles.filter(a => a.status === filter);

  const stats = {
    total:    articles.length,
    pending:  articles.filter(a => a.status === "pending").length,
    approved: articles.filter(a => a.status === "approved").length,
    revision: articles.filter(a => a.status === "revision").length,
    rejected: articles.filter(a => a.status === "rejected").length,
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Chief Reporter Dashboard</h1>
            <p className="text-xs text-muted-foreground">{profile?.full_name} • Team: {profile?.team_key}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="w-4 h-4 mr-2" />Logout
        </Button>
      </div>

      <main className="p-6 space-y-6 max-w-5xl mx-auto">

        {/* Success */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />{successMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total",    value: stats.total,    color: "text-foreground"  },
            { label: "Pending",  value: stats.pending,  color: "text-yellow-400"  },
            { label: "Approved", value: stats.approved, color: "text-green-400"   },
            { label: "Revision", value: stats.revision, color: "text-orange-400"  },
            { label: "Rejected", value: stats.rejected, color: "text-red-400"     },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "revision", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize",
                filter === f
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-secondary border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? `All (${stats.total})` : `${f} (${stats[f as keyof typeof stats]})`}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No articles in this category</p>
            </div>
          ) : filtered.map((article) => {
            const cfg    = statusConfig[article.status];
            const Icon   = cfg.icon;
            const isOpen = activeId === article.id;

            return (
              <div key={article.id} className="bg-card border border-border rounded-2xl overflow-hidden">

                {/* Article header */}
                <div className="p-5 flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg border mt-0.5", cfg.bg)}>
                    <Icon className={cn("w-4 h-4", cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{article.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        By <span className="text-foreground">{article.reporter_name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(article.submitted_at).toLocaleDateString()}
                      </span>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", cfg.bg, cfg.color)}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveId(isOpen ? null : article.id); setFeedback(article.feedback || ""); }}
                    className="text-sm text-primary hover:text-primary/80 font-medium shrink-0"
                  >
                    {isOpen ? "Close" : "Review"}
                  </button>
                </div>

                {/* Review panel */}
                {isOpen && (
                  <div className="border-t border-border p-5 space-y-4">
                    {/* Article content */}
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Article Content</p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{article.content}</p>
                    </div>

                    {/* Feedback input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        Feedback / Comments (optional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write feedback for the reporter..."
                        className="w-full h-28 p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all text-sm"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        size="sm"
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                        onClick={() => updateArticle(article.id, "approved", feedback)}
                        disabled={isUpdating}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />Approve
                      </Button>
                      <Button
                        size="sm"
                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30"
                        onClick={() => updateArticle(article.id, "revision", feedback)}
                        disabled={isUpdating || !feedback.trim()}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />Request Revision
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                        onClick={() => updateArticle(article.id, "rejected", feedback)}
                        disabled={isUpdating}
                      >
                        <XCircle className="w-4 h-4 mr-2" />Reject
                      </Button>
                      {isUpdating && <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />}
                      {!feedback.trim() && (
                        <p className="text-xs text-muted-foreground">* Feedback required for revision</p>
                      )}
                    </div>

                    {/* Existing feedback */}
                    {article.feedback && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Previous feedback: </span>
                        {article.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};