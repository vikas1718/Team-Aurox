// src/pages/ReporterDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Send, Clock, CheckCircle2, XCircle,
  AlertCircle, LogOut, RefreshCw, Plus, X, MessageSquare, User
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
  reviewed_at: string | null;
}

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending:  { label: "Pending Review", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: Clock        },
  approved: { label: "Approved",       color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",   icon: CheckCircle2 },
  revision: { label: "Needs Revision", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", icon: AlertCircle  },
  rejected: { label: "Rejected",       color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",       icon: XCircle      },
};

export const ReporterDashboard = () => {
  const navigate   = useNavigate();
  const [articles,     setArticles]     = useState<Article[]>([]);
  const [profile,      setProfile]      = useState<{ full_name: string; team_key: string } | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [title,        setTitle]        = useState("");
  const [content,      setContent]      = useState("");
  const [error,        setError]        = useState<string | null>(null);
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);

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

      if (!prof || prof.role !== "reporter") { navigate("/login"); return; }
      setProfile(prof);

      const { data: arts } = await supabase
        .from("articles")
        .select("*")
        .eq("reporter_id", session.user.id)
        .order("submitted_at", { ascending: false });

      setArticles(arts || []);
      setIsLoading(false);
    };
    load();
  }, [navigate]);

  // ── Submit article ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error: dbErr } = await supabase.from("articles").insert({
        reporter_id: session!.user.id,
        title:       title.trim(),
        content:     content.trim(),
        team_key:    profile!.team_key,
        status:      "pending",
      }).select().single();

      if (dbErr) throw new Error(dbErr.message);

      setArticles(prev => [data, ...prev]);
      setTitle("");
      setContent("");
      setShowForm(false);
      setSuccessMsg("Article submitted successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const stats = {
    total:    articles.length,
    pending:  articles.filter(a => a.status === "pending").length,
    approved: articles.filter(a => a.status === "approved").length,
    revision: articles.filter(a => a.status === "revision").length,
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
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Reporter Dashboard</h1>
            <p className="text-xs text-muted-foreground">{profile?.full_name} • Team: {profile?.team_key}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="w-4 h-4 mr-2" />Logout
        </Button>
      </div>

      <main className="p-6 space-y-6 max-w-4xl mx-auto">

        {/* Success */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />{successMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Submitted", value: stats.total,    color: "text-foreground"  },
            { label: "Pending Review",  value: stats.pending,  color: "text-yellow-400"  },
            { label: "Approved",        value: stats.approved, color: "text-green-400"   },
            { label: "Needs Revision",  value: stats.revision, color: "text-orange-400"  },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Submit Article Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">My Articles</h2>
          <Button
            className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <><X className="w-4 h-4 mr-2" />Cancel</> : <><Plus className="w-4 h-4 mr-2" />Submit Article</>}
          </Button>
        </div>

        {/* Submit Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">New Article</h3>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">⚠️ {error}</div>
            )}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title..."
              className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here..."
              className="w-full h-48 p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{content.split(/\s+/).filter(Boolean).length} words</p>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground"
              >
                {isSubmitting
                  ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                  : <><Send className="w-4 h-4 mr-2" />Submit for Review</>}
              </Button>
            </div>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-3">
          {articles.length === 0 ? (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No articles submitted yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Submit Article" to get started</p>
            </div>
          ) : articles.map((article) => {
            const cfg     = statusConfig[article.status];
            const Icon    = cfg.icon;
            const isOpen  = expandedId === article.id;
            return (
              <div key={article.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div
                  className="p-5 flex items-start gap-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : article.id)}
                >
                  <div className={cn("p-2 rounded-lg border mt-0.5", cfg.bg)}>
                    <Icon className={cn("w-4 h-4", cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {new Date(article.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn("text-xs font-medium px-3 py-1 rounded-full border", cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                </div>

                {/* Expanded — feedback */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground line-clamp-4">{article.content}</p>
                    {article.feedback && (
                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-1">
                        <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                          <MessageSquare className="w-4 h-4" />
                          Feedback from Chief Reporter
                        </div>
                        <p className="text-sm text-foreground">{article.feedback}</p>
                        {article.reviewed_at && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(article.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    {!article.feedback && (
                      <p className="text-sm text-muted-foreground italic">No feedback yet.</p>
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