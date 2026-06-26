import { useState, useEffect } from "react";
import {
  Wand2, Copy, Check, ArrowRight,
  Minus, Plus, RefreshCw,
  BookOpen, Newspaper, MessageSquare, Radio, Sparkles, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Target
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

const tones = [
  { id: "formal",        name: "Formal",        emoji: "🎩" },
  { id: "casual",        name: "Casual",        emoji: "😊" },
  { id: "investigative", name: "Investigative", emoji: "🔍" },
  { id: "breaking",      name: "Breaking News", emoji: "🚨" },
  { id: "opinion",       name: "Opinion",       emoji: "💬" },
];

const categories = [
  { id: "politics",    name: "Politics",    emoji: "🏛️" },
  { id: "sports",      name: "Sports",      emoji: "⚽" },
  { id: "technology",  name: "Technology",  emoji: "💻" },
  { id: "crime",       name: "Crime",       emoji: "🚔" },
  { id: "business",    name: "Business",    emoji: "📈" },
  { id: "health",      name: "Health",      emoji: "🏥" },
  { id: "environment", name: "Environment", emoji: "🌿" },
  { id: "education",   name: "Education",   emoji: "🎓" },
];

const writingStyles = [
  { id: "descriptive", name: "Descriptive" },
  { id: "summary",     name: "Summary"     },
  { id: "interview",   name: "Interview"   },
  { id: "analytical",  name: "Analytical"  },
];

const languages = [
  { id: "english", name: "English" },
  { id: "hindi",   name: "Hindi"   },
  { id: "kannada", name: "Kannada" },
];

// ── FIXED: Prompt now anchors to the source content first ─────────────────
// Key fixes:
// 1. Source content appears FIRST so the model reads it before instructions
// 2. Strict word range (min AND max) with a counting reminder
// 3. "Do not add topics not in the source" prevents hallucination
// 4. System role separated from user prompt for clarity
const buildSystemPrompt = (
  format: string,
  tone: string,
  category: string,
  writingStyle: string,
  language: string
): string => {
  return `You are a professional news editor specializing in ${category} content.
Your job is to REWRITE the user's provided article — you must stay strictly on the same topic, facts, and events as the source.
DO NOT invent new events, topics, people, or facts that are not in the source.
Output format: ${format}
Tone: ${tone}
Writing style: ${writingStyle}
Language: ${language} only — every single word must be in ${language}.
Return ONLY the article body — no title, no headings, no labels, no preamble.`;
};

const buildUserPrompt = (
  content: string,
  wordCount: number
): string => {
  const minWords = Math.max(50,  Math.round(wordCount * 0.9));
  const maxWords = Math.round(wordCount * 1.1);

  return `Here is the source article you must adapt:

---SOURCE START---
${content}
---SOURCE END---

Rewrite the above source article strictly based on its content.
Word count: write between ${minWords} and ${maxWords} words — count carefully as you write and stop when you reach ${maxWords} words.
Do not add any topics, events, or facts that are not present in the source above.`;
};

// ── Token budget: ~1.4 tokens per English word, 1.8 for Hindi/Kannada ─────
const wordsToTokens = (words: number, language: string): number => {
  const multiplier = language === "english" ? 1.5 : 2.0;
  // Add 20% buffer, cap at 4096
  return Math.min(4096, Math.ceil(words * multiplier * 1.2));
};

export const ContentEditor = () => {
  const [inputText,        setInputText]        = useState("");
  const [outputText,       setOutputText]       = useState("");
  const [targetWordCount,  setTargetWordCount]  = useState([400]);
  const [selectedFormat,   setSelectedFormat]   = useState(outputFormats[0]);
  const [isProcessing,     setIsProcessing]     = useState(false);
  const [copied,           setCopied]           = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const [userId,           setUserId]           = useState<string | null>(null);
  const [wordCountStatus,  setWordCountStatus]  = useState<"ok" | "over" | "under" | null>(null);

  const [showInjection,    setShowInjection]    = useState(false);
  const [selectedTone,     setSelectedTone]     = useState(tones[0]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedStyle,    setSelectedStyle]    = useState(writingStyles[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  const inputWordCount  = inputText.trim()   ? inputText.split(/\s+/).filter(Boolean).length  : 0;
  const outputWordCount = outputText.trim()  ? outputText.split(/\s+/).filter(Boolean).length : 0;

  // ── Word count accuracy badge ────────────────────────────────
  useEffect(() => {
    if (!outputText) { setWordCountStatus(null); return; }
    const target = targetWordCount[0];
    const pct    = outputWordCount / target;
    if (pct >= 0.88 && pct <= 1.12)      setWordCountStatus("ok");
    else if (outputWordCount > target)   setWordCountStatus("over");
    else                                  setWordCountStatus("under");
  }, [outputText, outputWordCount, targetWordCount]);

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

  // ── FIXED: Groq call with system/user split + dynamic token budget ───────
  const callGroq = async (
    content: string,
    format: string,
    wordCount: number
  ): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error("Add VITE_GROQ_API_KEY to .env.local and restart.");

    const systemPrompt = buildSystemPrompt(
      format,
      selectedTone.name,
      selectedCategory.name,
      selectedStyle.name,
      selectedLanguage.name
    );

    const userPrompt = buildUserPrompt(content, wordCount);

    // Dynamic token budget so short targets aren't over-generated
    const maxTokens = wordsToTokens(wordCount, selectedLanguage.id);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model:      "llama-3.1-8b-instant",
        max_tokens: maxTokens,           // ← dynamic, not hardcoded 2048
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   },
        ],
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "Unknown error");
      throw new Error(`API Error ${res.status}: ${msg}`);
    }

    const data = await res.json();
    const raw  = data.choices?.[0]?.message?.content ?? "";

    // ── Post-process: trim to word limit if model slightly overshot ───────
    const words = raw.split(/\s+/).filter(Boolean);
    const maxWords = Math.round(wordCount * 1.1);
    if (words.length > maxWords) {
      // Trim to maxWords and close with an ellipsis-safe sentence boundary
      const trimmed = words.slice(0, maxWords).join(" ");
      const lastPeriod = trimmed.lastIndexOf(".");
      return lastPeriod > trimmed.length * 0.8
        ? trimmed.slice(0, lastPeriod + 1)
        : trimmed;
    }
    return raw;
  };

  // ── Save to Supabase ─────────────────────────────────────────
  const saveToSupabase = async (
    original: string,
    adapted: string,
    format: string,
    wordCount: number
  ) => {
    if (!userId) return;
    const { error: dbError } = await supabase.from("content_adaptations").insert({
      user_id:           userId,
      original_text:     original,
      adapted_text:      adapted,
      format:            format,
      target_word_count: wordCount,
      tone:              selectedTone.name,
      category:          selectedCategory.name,
      writing_style:     selectedStyle.name,
      language:          selectedLanguage.name,
    });
    if (dbError) console.error("Supabase save error:", dbError.message);
  };

  // ── Main handler ─────────────────────────────────────────────
  const handleAdapt = async () => {
    if (!inputText.trim()) { setError("Please enter some content first."); return; }
    setError(null);
    setIsProcessing(true);
    setOutputText("");
    try {
      const adapted = await callGroq(inputText, selectedFormat.name, targetWordCount[0]);
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

  const handleReset = () => {
    setOutputText("");
    setError(null);
    setWordCountStatus(null);
  };

  // ── Word count badge ─────────────────────────────────────────
  const WordCountBadge = () => {
    if (!wordCountStatus) return null;
    const config = {
      ok:    { icon: CheckCircle2, text: "On target",  cls: "text-green-400 bg-green-500/10 border-green-500/30" },
      over:  { icon: AlertCircle,  text: "Over limit", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      under: { icon: Target,       text: "Under target",cls: "text-blue-400  bg-blue-500/10  border-blue-500/30"  },
    }[wordCountStatus];
    const Icon = config.icon;
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border", config.cls)}>
        <Icon className="w-3 h-3" /> {config.text}
      </span>
    );
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

        {/* ── Prompt Injection Panel ── */}
        <div className="card-elevated overflow-hidden">
          <button
            onClick={() => setShowInjection(!showInjection)}
            className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Prompt Injection</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTone.emoji} {selectedTone.name} · {selectedCategory.emoji} {selectedCategory.name} · {selectedStyle.name} · {selectedLanguage.name}
                </p>
              </div>
            </div>
            {showInjection
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {showInjection && (
            <div className="px-6 pb-6 space-y-5 border-t border-border">

              {/* Tone */}
              <div>
                <p className="text-sm font-medium text-foreground mt-5 mb-3">Tone</p>
                <div className="flex flex-wrap gap-2">
                  {tones.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2",
                        selectedTone.id === tone.id
                          ? "bg-primary/10 border border-primary/40 text-primary"
                          : "bg-secondary border border-transparent text-muted-foreground hover:bg-secondary/80"
                      )}
                    >
                      <span>{tone.emoji}</span> {tone.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2",
                        selectedCategory.id === cat.id
                          ? "bg-primary/10 border border-primary/40 text-primary"
                          : "bg-secondary border border-transparent text-muted-foreground hover:bg-secondary/80"
                      )}
                    >
                      <span>{cat.emoji}</span> {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Writing Style + Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Writing Style</p>
                  <div className="grid grid-cols-2 gap-2">
                    {writingStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-sm transition-all text-center",
                          selectedStyle.id === style.id
                            ? "bg-primary/10 border border-primary/40 text-primary"
                            : "bg-secondary border border-transparent text-muted-foreground hover:bg-secondary/80"
                        )}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Language</p>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-sm transition-all text-center",
                          selectedLanguage.id === lang.id
                            ? "bg-primary/10 border border-primary/40 text-primary"
                            : "bg-secondary border border-transparent text-muted-foreground hover:bg-secondary/80"
                        )}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Input */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Original Content</h3>
              <span className={cn(
                "text-sm",
                inputWordCount === 0 ? "text-muted-foreground" : "text-foreground"
              )}>
                {inputWordCount} words
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your original article or content here..."
              className="w-full h-80 p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
            />
            {inputWordCount > 0 && inputWordCount < 20 && (
              <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Add more content for better results (at least 20 words recommended)
              </p>
            )}
          </div>

          {/* Output */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Adapted Content</h3>
              <div className="flex items-center gap-2">
                <WordCountBadge />
                <span className="text-sm text-muted-foreground">{outputWordCount} / {targetWordCount[0]} words</span>
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
                  <p className="text-muted-foreground text-xs">Targeting ~{targetWordCount[0]} words</p>
                </div>
              ) : outputText ? (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{outputText}</p>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-muted-foreground">Adapted content will appear here</p>
                  <p className="text-xs text-muted-foreground">Your original content will be rewritten — not replaced</p>
                </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{targetWordCount[0]} words</span>
                  <span className="text-xs text-muted-foreground">(±10% tolerance)</span>
                </div>
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
                onClick={handleReset}
                disabled={!outputText}
              >
                <RefreshCw className="w-4 h-4 mr-2" />Reset
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