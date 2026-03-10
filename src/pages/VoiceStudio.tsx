// src/pages/VoiceStudio.tsx
import { useState, useRef, useEffect } from "react";
import {
  Mic2, Play, Pause, Download, Volume2,
  Settings, Wand2, RefreshCw, CheckCircle2, Database,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";



const BUCKET = "voice-audio";

const voices = [
  { id: "1", name: "Sarah", accent: "American", gender: "Female", apiVoice: "Scarlett" },
  { id: "2", name: "James", accent: "British",  gender: "Male",   apiVoice: "Dan"      },
  { id: "3", name: "Priya", accent: "Indian",   gender: "Female", apiVoice: "Liv"      },
  { id: "4", name: "Chen",  accent: "Chinese",  gender: "Male",   apiVoice: "Will"     },
  { id: "5", name: "Maria", accent: "Spanish",  gender: "Female", apiVoice: "Amy"      },
  { id: "6", name: "Ahmed", accent: "Arabic",   gender: "Male",   apiVoice: "Alfred"   },
];

export const VoiceStudio = () => {
  const [selectedVoice, setSelectedVoice] = useState(voices[0]);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
  const [speed,        setSpeed]        = useState([1.0]);
  const [pitch,        setPitch]        = useState([1.0]);
  const [inputText,    setInputText]    = useState("");
  const [audioUrl,     setAudioUrl]     = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [saveStatus,   setSaveStatus]   = useState<string | null>(null);
  const [userId,       setUserId]       = useState<string | null>(null);
  const [elapsed,      setElapsed]      = useState(0);   // seconds played
  const [duration,     setDuration]     = useState(0);   // total seconds

  // ── Web Audio API refs ───────────────────────────────────────
  // We use AudioContext so we can control both playbackRate (speed)
  // and pitch shift in real-time
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null);
  const audioBufRef    = useRef<ArrayBuffer | null>(null);
  const gainRef        = useRef<GainNode | null>(null);
  const rafRef         = useRef<number | null>(null);      // requestAnimationFrame id
  const startTimeRef   = useRef<number>(0);                // AudioContext time when playback started
  const offsetRef      = useRef<number>(0);                // seconds already played before pause

  // ── Auto anonymous sign-in ───────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { setUserId(session.user.id); return; }
      const { data } = await supabase.auth.signInAnonymously();
      if (data?.user) setUserId(data.user.id);
    };
    init();
  }, []);

  // ── Timer tick via requestAnimationFrame ────────────────────
  const startTicker = () => {
    const tick = () => {
      if (!audioCtxRef.current || !sourceRef.current) return;
      const secs = offsetRef.current + (audioCtxRef.current.currentTime - startTimeRef.current);
      setElapsed(secs);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopTicker = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // ── Stop any playing audio ───────────────────────────────────
  const stopAudio = () => {
    stopTicker();
    try { sourceRef.current?.stop(); } catch (_) {}
    sourceRef.current = null;
    setIsPlaying(false);
  };

  // ── Call Unreal Speech API ───────────────────────────────────
  const callTTS = async (text: string, apiVoice: string): Promise<ArrayBuffer> => {
    const apiKey = import.meta.env.VITE_UNREALSPEECH_API_KEY;
    if (!apiKey || apiKey === "your-key-here") {
      throw new Error("Add VITE_UNREALSPEECH_API_KEY to .env.local and restart.");
    }

    // Unreal Speech speed range: -1.0 (slowest) to 1.0 (fastest)
    // Our slider: 0.5x to 2.0x — map so 1.0 → 0, 0.5 → -0.5, 2.0 → 1.0
    const apiSpeed = parseFloat(Math.min(1, Math.max(-1, speed[0] - 1.0)).toFixed(1));

    const res = await fetch("https://api.v7.unrealspeech.com/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Text:          text,
        VoiceId:       apiVoice,
        Bitrate:       "192k",
        Speed:         apiSpeed,   // ✅ clamped number
        Pitch:         1.0,        // API free tier fixed at 1.0
        OutputFormat:  "mp3",
        TimestampType: "word",
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "Unknown error");
      throw new Error(`TTS Error ${res.status}: ${msg}`);
    }

    const json = await res.json();
    const outputUri: string = json?.OutputUri || json?.output_uri;
    if (!outputUri) throw new Error(`No OutputUri in response: ${JSON.stringify(json)}`);

    // Fetch the actual MP3 bytes
    const mp3Res = await fetch(outputUri);
    if (!mp3Res.ok) throw new Error("Failed to download audio from OutputUri.");
    return mp3Res.arrayBuffer();
  };

  // ── Play audio with speed + pitch applied via Web Audio ──────
  // playbackRate controls speed
  // pitch shift: detune (cents) = 1200 * log2(pitch)
  const playWithSettings = async (arrayBuffer: ArrayBuffer) => {
    stopAudio();

    // Always create a fresh AudioContext
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Clone the buffer because decodeAudioData consumes it
    const bufferCopy = arrayBuffer.slice(0);
    const decoded    = await ctx.decodeAudioData(bufferCopy);

    const source  = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    gainRef.current = gainNode;

    source.buffer = decoded;
    source.playbackRate.value = speed[0];
    const detuneValue = 1200 * Math.log2(pitch[0]);
    source.detune.value = detuneValue;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.onended = () => {
      stopTicker();
      setIsPlaying(false);
      setElapsed(0);
      offsetRef.current = 0;
    };

    // Record when we started so the ticker can compute elapsed
    startTimeRef.current = ctx.currentTime;
    setDuration(decoded.duration);

    source.start();
    sourceRef.current = source;
    setIsPlaying(true);
    startTicker();
  };

  // ── Generate ─────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!inputText.trim()) { setError("Please enter some text first."); return; }
    setError(null);
    setSaveStatus(null);
    stopAudio();
    setElapsed(0);
    setDuration(0);
    offsetRef.current = 0;
    setIsGenerating(true);

    try {
      const arrayBuffer = await callTTS(inputText, selectedVoice.apiVoice);

      // Save raw bytes for re-play
      audioBufRef.current = arrayBuffer;

      // Create blob URL for download button
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      setAudioUrl(URL.createObjectURL(blob));

      // Auto-play with current speed + pitch
      await playWithSettings(arrayBuffer);

      // Save to Supabase
      setIsGenerating(false);
      setIsSaving(true);
      setSaveStatus("⏳ Saving to Supabase...");

      if (userId) {
        const fileName = `${userId}/${Date.now()}.mp3`;
        await supabase.storage
          .from(BUCKET)
          .upload(fileName, blob, { contentType: "audio/mpeg", upsert: false });

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

        await supabase.from("voice_notes").insert({
          user_id:          userId,
          input_text:       inputText,
          voice_id:         selectedVoice.id,
          voice_name:       selectedVoice.name,
          speed:            speed[0],
          pitch:            pitch[0],
          audio_url:        urlData.publicUrl,
          duration_seconds: null,
        });

        setSaveStatus("✅ Saved to Supabase!");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
      setIsSaving(false);
    }
  };

  // ── Play / Pause ─────────────────────────────────────────────
  // Re-creates the source node so speed + pitch are always applied fresh
  const handlePlayPause = async () => {
    if (!audioBufRef.current) return;

    if (isPlaying) {
      // Save how far we've played so resume starts from here
      offsetRef.current = elapsed;
      stopAudio();
    } else {
      try {
        await playWithSettings(audioBufRef.current);
      } catch (e) {
        setError("Playback failed: " + (e as Error).message);
      }
    }
  };

  // ── Download ─────────────────────────────────────────────────
  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `voice-note-${Date.now()}.mp3`;
    a.click();
  };

  // ── Voice Preview ─────────────────────────────────────────────
  const handleVoicePreview = async (voice: typeof voices[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPreviewing(voice.id);
    try {
      const buf = await callTTS(`Hi, I'm ${voice.name}.`, voice.apiVoice);
      const ctx = new AudioContext();
      const decoded = await ctx.decodeAudioData(buf);
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      src.connect(ctx.destination);
      src.start();
    } catch { /* silent fail */ }
    finally { setIsPreviewing(null); }
  };

  const isLoading = isGenerating || isSaving;

  return (
    <div className="min-h-screen">
      <Header
        title="Notes to Voice"
        subtitle="Transform your written content into natural speech"
      />

      <main className="p-6 space-y-6">

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">✕</button>
          </div>
        )}

        {/* Save status */}
        {saveStatus && (
          <div className={cn(
            "p-4 rounded-xl border text-sm flex items-center gap-2",
            saveStatus.includes("✅")
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-blue-500/10 border-blue-500/30 text-blue-400"
          )}>
            {saveStatus.includes("✅")
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
            {saveStatus}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Text Input */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Input Text</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {inputText.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Wand2 className="w-4 h-4 mr-2" />Improve
                  </Button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your news article, script, or notes here..."
                className="w-full h-64 p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
              />
            </div>

            {/* Audio Preview */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Audio Preview</h3>

              <div className="h-24 rounded-xl bg-secondary/50 border border-border flex items-center justify-center mb-4 overflow-hidden">
                <div className="flex items-end gap-1 h-16">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn("w-1 rounded-full bg-primary/30 transition-all", isPlaying && "animate-pulse")}
                      style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePlayPause}
                  disabled={!audioBufRef.current && !audioUrl}
                  className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground disabled:opacity-40"
                >
                  {isPlaying
                    ? <><Pause className="w-4 h-4 mr-2" />Pause</>
                    : <><Play  className="w-4 h-4 mr-2" />Play</>}
                </Button>

                <div className="flex-1 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {Math.floor(elapsed / 60).toString().padStart(2, "0")}:{Math.floor(elapsed % 60).toString().padStart(2, "0")}
                  </span>
                  <div className="flex-1 timeline-bar">
                    <div
                      className="timeline-progress"
                      style={{ width: duration > 0 ? `${Math.min((elapsed / duration) * 100, 100)}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {duration > 0
                      ? `${Math.floor(duration / 60).toString().padStart(2, "0")}:${Math.floor(duration % 60).toString().padStart(2, "0")}`
                      : "--:--"}
                  </span>
                </div>

                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Volume2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  disabled={!audioUrl}
                  onClick={handleDownload}
                  className="text-muted-foreground disabled:opacity-40"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-4">

            {/* Voice Selection */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Voice Selection</h3>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                      selectedVoice.id === voice.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 border border-transparent hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                      selectedVoice.id === voice.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {voice.name[0]}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-foreground">{voice.name}</p>
                      <p className="text-xs text-muted-foreground">{voice.accent} • {voice.gender}</p>
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={(e) => handleVoicePreview(voice, e)}
                      disabled={isPreviewing === voice.id}
                    >
                      {isPreviewing === voice.id
                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                        : <Play className="w-4 h-4" />}
                    </Button>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Settings */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Voice Settings</h3>
              <div className="space-y-6">

                {/* Speed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">Speed</label>
                    <span className="text-sm font-medium text-foreground">{speed[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={(val) => {
                      setSpeed(val);
                      // If audio is playing, update playbackRate in real-time
                      if (sourceRef.current) {
                        sourceRef.current.playbackRate.value = val[0];
                      }
                    }}
                    min={0.5} max={2.0} step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">0.5x Slow</span>
                    <span className="text-xs text-muted-foreground">2.0x Fast</span>
                  </div>
                </div>

                {/* Pitch */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">Pitch</label>
                    <span className="text-sm font-medium text-foreground">{pitch[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={pitch}
                    onValueChange={(val) => {
                      setPitch(val);
                      // Update detune in real-time while playing
                      if (sourceRef.current) {
                        sourceRef.current.detune.value = 1200 * Math.log2(val[0]);
                      }
                    }}
                    min={0.5} max={2.0} step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">0.5x Low</span>
                    <span className="text-xs text-muted-foreground">2.0x High</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full bg-gradient-to-r from-primary to-amber-600 text-primary-foreground h-12 disabled:opacity-60"
              onClick={handleGenerate}
              disabled={isLoading || !inputText.trim()}
            >
              {isGenerating
                ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Generating...</>
                : isSaving
                ? <><Database className="w-5 h-5 mr-2 animate-pulse" />Saving...</>
                : <><Mic2 className="w-5 h-5 mr-2" />Generate Voice</>}
            </Button>

          </div>
        </div>
      </main>
    </div>
  );
};