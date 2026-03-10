import { useState, useEffect } from "react";
import {
  Wand2, Copy, Check, ArrowRight,
  Minus, Plus, RefreshCw,
  BookOpen, Newspaper, MessageSquare, Radio
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";


const outputFormats = [
  { id: "web",    name: "Web Article",   icon: BookOpen,      wordCount: 800 },
  { id: "print",  name: "Print Edition", icon: Newspaper,     wordCount: 500 },
  { id: "social", name: "Social Post",   icon: MessageSquare, wordCount: 280 },
  { id: "radio",  name: "Radio Script",  icon: Radio,         wordCount: 150 },
];

export const ContentEditor = () => {
  const [inputText,       setInputText]       = useState("");
  const [outputText,      setOutputText]      = useState("");
  const [targetWordCount, setTargetWordCount] = useState([400]);
  const [selectedFormat,  setSelectedFormat]  = useState(outputFormats[0]);
  const [isProcessing,    setIsProcessing]    = useState(false);
  const [copied,          setCopied]          = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [userId,          setUserId]          = useState<string | null>(null);

  const inputWordCount  = inputText.split(/\s+/).filter(Boolean).length;
  const outputWordCount = outputText.split(/\s+/).filter(Boolean).length;

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

 const callClaude = async (content: string, format: string, wordCount: number): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("Add VITE_GROQ_API_KEY to .env.local and restart.");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",   // free model
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `You are a professional content editor. Adapt the following content for a ${format} format.
Target word count: ${wordCount} words.
Return ONLY the adapted content — no explanations, no headings, no extra commentary.

Original content:
${content}`,
      }],
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "Unknown error");
    throw new Error(`API Error ${res.status}: ${msg}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
};

  // ── Save to Supabase ─────────────────────────────────────────
  const saveToSupabase = async (original: string, adapted: string, format: string, wordCount: number) => {
    if (!userId) return;
    const { error: dbError } = await supabase.from("content_adaptations").insert({
      user_id:           userId,
      original_text:     original,
      adapted_text:      adapted,
      format:            format,
      target_word_count: wordCount,
    });
    if (dbError) console.error("Supabase save error:", dbError.message);
  };

  // ── Main handler ─────────────────────────────────────────────
  const handleAdapt = async () => {
    if (!inputText.trim()) { setError("Please enter some content first."); return; }
    setError(null);
    setIsProcessing(true);
    try {
      const adapted = await callClaude(inputText, selectedFormat.name, targetWordCount[0]);
      setOutputText(adapted);
      await saveToSupabase(inputText, adapted, selectedFormat.name, targetWordCount[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Header title="Content Editor" subtitle="Adapt your content for any platform or word count" />

      <main className="p-6 space-y-6">

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">✕</button>
          </div>
        )}

        {/* Format Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {outputFormats.map((format, index) => (
            <button
              key={format.id}
              onClick={() => {
                setSelectedFormat(format);
                setTargetWordCount([format.wordCount]);
              }}
              className={cn(
                "tool-card text-left",
                selectedFormat.id === format.id && "border-primary/50 bg-primary/5",
                "opacity-0 animate-slide-up",
                `stagger-${index + 1}`
              )}
            >
              <format.icon className={cn(
                "w-8 h-8 mb-3",
                selectedFormat.id === format.id ? "text-primary" : "text-muted-foreground"
              )} />
              <p className="font-medium text-foreground">{format.name}</p>
              <p className="text-sm text-muted-foreground">{format.wordCount} words</p>
            </button>
          ))}
        </div>

        {/* Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Input */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Original Content</h3>
              <span className="text-sm text-muted-foreground">{inputWordCount} words</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your original article or content here..."
              className="w-full h-80 p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
            />
          </div>

          {/* Output */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Adapted Content</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{outputWordCount} words</span>
                <Button
                  variant="ghost" size="sm"
                  onClick={handleCopy}
                  className="text-muted-foreground"
                  disabled={!outputText}
                >
                  {copied
                    ? <Check className="w-4 h-4 text-green-400" />
                    : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className={cn(
              "w-full h-80 p-4 rounded-xl bg-secondary/50 border border-border overflow-auto",
              !outputText && "flex items-center justify-center"
            )}>
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-muted-foreground text-sm">Adapting your content...</p>
                </div>
              ) : outputText ? (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{outputText}</p>
              ) : (
                <p className="text-muted-foreground text-center">Adapted content will appear here</p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="card-elevated p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">

            {/* Word Count Slider */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Target Word Count</span>
                <span className="text-sm font-medium text-foreground">{targetWordCount[0]} words</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost" size="icon"
                  onClick={() => setTargetWordCount([Math.max(50, targetWordCount[0] - 50)])}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Slider
                  value={targetWordCount}
                  onValueChange={setTargetWordCount}
                  min={50} max={2000} step={50}
                  className="flex-1"
                />
                <Button
                  variant="ghost" size="icon"
                  onClick={() => setTargetWordCount([Math.min(2000, targetWordCount[0] + 50)])}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => { setOutputText(""); setError(null); }}
                disabled={!outputText}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleAdapt}
                disabled={isProcessing || !inputText.trim()}
                className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground"
              >
                {isProcessing ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" />Adapt Content<ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};