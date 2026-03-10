// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mic2, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Login = () => {
  const navigate = useNavigate();
  const [email,     setEmail]    = useState("");
  const [password,  setPassword] = useState("");
  const [teamKey,   setTeamKey]  = useState("");
  const [showPass,  setShowPass] = useState(false);
  const [isLoading, setIsLoading]= useState(false);
  const [error,     setError]    = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim() || !teamKey.trim()) {
      setError("Please fill in all fields — email, password and team key.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // ── Step 1: Sign in with Supabase Auth ────────────────────
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email:    email.trim(),
          password: password.trim(),
        });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("invalid login") ||
          authError.message.toLowerCase().includes("invalid credentials")
        ) {
          throw new Error("Incorrect email or password.");
        }
        throw new Error(authError.message);
      }

      const userId = authData.user.id;
      console.log("✅ Auth success. User ID:", userId);

      // ── Step 2: Fetch profile ─────────────────────────────────
      // Use maybeSingle() — returns null instead of throwing when no row found
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role, team_key, full_name")
        .eq("id", userId)
        .maybeSingle();

      console.log("📋 Profile fetch result:", profile, "Error:", profileError);

      // If RLS blocked it or row doesn't exist
      if (profileError) {
        console.error("Profile error code:", profileError.code, profileError.message);
        await supabase.auth.signOut();
        throw new Error(
          `Profile fetch failed (${profileError.code}). ` +
          `Make sure the user_profiles row exists and RLS policy allows SELECT.`
        );
      }

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error(
          `No profile found for this account (ID: ${userId}). ` +
          `Please insert a row in user_profiles for this user.`
        );
      }

      // ── Step 3: Verify team key ───────────────────────────────
      const storedKey  = profile.team_key.trim().toLowerCase();
      const enteredKey = teamKey.trim().toLowerCase();

      console.log("🔑 Team key check — stored:", storedKey, "| entered:", enteredKey);

      if (storedKey !== enteredKey) {
        await supabase.auth.signOut();
        throw new Error("Invalid team key. Please check and try again.");
      }

      // ── Step 4: Redirect by role ──────────────────────────────
      console.log("🎭 Role:", profile.role);

      if (profile.role === "reporter") {
        navigate("/reporter-dashboard");
      } else if (profile.role === "chief_reporter") {
        navigate("/chief-dashboard");
      } else if (profile.role === "sub_editor") {
        navigate("/");
      } else {
        throw new Error(`Unknown role "${profile.role}". Contact your administrator.`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Mic2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Devin</h1>
          <p className="text-muted-foreground mt-1">News Weaver Platform</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-5">

          <div className="text-center pb-1">
            <h2 className="text-lg font-semibold text-foreground">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in with your credentials</p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@newsroom.com"
              className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground font-medium">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-11 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Team Key */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground font-medium">Team Key</label>
            <input
              type="text"
              value={teamKey}
              onChange={(e) => setTeamKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. TEAM-2024-NEWS"
              className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <p className="text-xs text-muted-foreground">
              Contact your administrator if you don't have a team key
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full h-11 bg-gradient-to-r from-primary to-amber-600 text-primary-foreground disabled:opacity-60"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading
              ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Verifying...</>
              : <><LogIn className="w-4 h-4 mr-2" />Login</>}
          </Button>

          {/* Role hint */}
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs text-muted-foreground text-center font-medium">Access levels</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs font-medium text-blue-400">Reporter</p>
                <p className="text-xs text-muted-foreground mt-0.5">Submit articles</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-xs font-medium text-orange-400">Chief</p>
                <p className="text-xs text-muted-foreground mt-0.5">Review & approve</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs font-medium text-green-400">Sub Editor</p>
                <p className="text-xs text-muted-foreground mt-0.5">Full access</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          AI Devin — News Weaver Platform © 2026
        </p>
      </div>
    </div>
  );
};