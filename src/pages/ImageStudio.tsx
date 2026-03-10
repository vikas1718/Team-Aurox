import { useState, useEffect } from "react";
import {
  Image, Wand2, Download, RefreshCw,
  Maximize, Grid3X3, Settings, Sparkles, Palette
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";



const styles = [
  { id: "photorealistic", name: "Photorealistic", icon: "📷" },
  { id: "editorial",      name: "Editorial",      icon: "📰" },
  { id: "illustration",   name: "Illustration",   icon: "🎨" },
  { id: "minimalist",     name: "Minimalist",     icon: "⬜" },
  { id: "dramatic",       name: "Dramatic",       icon: "🎭" },
  { id: "infographic",    name: "Infographic",    icon: "📊" },
];

const aspectRatios = [
  { id: "1:1",  name: "Square",    width: 1024, height: 1024 },
  { id: "16:9", name: "Landscape", width: 1344, height: 768  },
  { id: "9:16", name: "Portrait",  width: 768,  height: 1344 },
  { id: "4:3",  name: "Standard",  width: 1152, height: 896  },
];

export const ImageStudio = () => {
  const [selectedStyle,    setSelectedStyle]    = useState(styles[0]);
  const [selectedRatio,    setSelectedRatio]    = useState(aspectRatios[0]);
  const [prompt,           setPrompt]           = useState("");
  const [isGenerating,     setIsGenerating]     = useState(false);
  const [generatedImages,  setGeneratedImages]  = useState<string[]>([]);
  const [error,            setError]            = useState<string | null>(null);
  const [userId,           setUserId]           = useState<string | null>(null);
  const [expandedImg,      setExpandedImg]      = useState<string | null>(null);

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

  // ── Call Stability AI API ────────────────────────────────────
  const generateImage = async (imagePrompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
    if (!apiKey) throw new Error("Add VITE_STABILITY_API_KEY to .env.local and restart.");

    // Add style to prompt
    const fullPrompt = `${imagePrompt}, ${selectedStyle.name} style, high quality, detailed`;

    const formData = new FormData();
    formData.append("prompt",          fullPrompt);
    formData.append("output_format",   "jpeg");
    formData.append("width",           String(selectedRatio.width));
    formData.append("height",          String(selectedRatio.height));

    const res = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept":        "image/*",
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const msg = await res.text().catch(() => "Unknown error");
      throw new Error(`Stability API Error ${res.status}: ${msg}`);
    }

    // Convert image blob to base64 URL
    const blob      = await res.blob();
    const base64Url = await new Promise<string>((resolve) => {
      const reader  = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    return base64Url;
  };

  // ── Upload image to Supabase Storage ────────────────────────
  const uploadToStorage = async (base64Url: string, uid: string): Promise<string> => {
    // Convert base64 to blob
    const res      = await fetch(base64Url);
    const blob     = await res.blob();
    const fileName = `${uid}/${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("generated-images")
      .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });

    if (uploadError) {
      console.error("Storage upload failed:", uploadError.message);
      return base64Url; // fallback to base64 if upload fails
    }

    const { data } = supabase.storage.from("generated-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  // ── Save to DB ───────────────────────────────────────────────
  const saveToDatabase = async (imageUrl: string, uid: string) => {
    const { error: dbError } = await supabase.from("generated_images").insert({
      user_id:      uid,
      prompt:       prompt,
      style:        selectedStyle.name,
      aspect_ratio: selectedRatio.id,
      image_url:    imageUrl,
    });
    if (dbError) console.error("DB save error:", dbError.message);
  };

  // ── Main Generate Handler ────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) { setError("Please enter a prompt first."); return; }
    setError(null);
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      // Generate 2 images in parallel
      const [img1, img2] = await Promise.all([
        generateImage(prompt),
        generateImage(prompt),
      ]);

      const images = [img1, img2];
      setGeneratedImages(images);

      // Save both to Supabase
      if (userId) {
        await Promise.all(images.map(async (img) => {
          const publicUrl = await uploadToStorage(img, userId);
          await saveToDatabase(publicUrl, userId);
        }));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Download image ───────────────────────────────────────────
  const handleDownload = (imgUrl: string, index: number) => {
    const a      = document.createElement("a");
    a.href       = imgUrl;
    a.download   = `generated-image-${Date.now()}-${index + 1}.jpg`;
    a.click();
  };

  return (
    <div className="min-h-screen">
      <Header title="Image Creation" subtitle="Generate stunning visuals with AI" />

      <main className="p-6 space-y-6">

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Generation Panel ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Prompt */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Describe Your Image</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A professional news anchor in a modern studio, warm lighting, editorial photography style..."
                className="w-full h-32 p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost" size="sm"
                    className="text-muted-foreground"
                    onClick={() => setPrompt(prompt + ", highly detailed, professional, 4K")}
                    disabled={!prompt}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />Enhance Prompt
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="text-muted-foreground"
                    onClick={() => setPrompt("")}
                    disabled={!prompt}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />Clear
                  </Button>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground disabled:opacity-60"
                >
                  {isGenerating ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Generate Images</>
                  )}
                </Button>
              </div>
            </div>

            {/* Generated Images */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Generated Images</h3>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Grid3X3 className="w-4 h-4 mr-2" />Grid View
                </Button>
              </div>

              {isGenerating ? (
                <div className="h-64 rounded-xl bg-secondary/30 border border-border flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm">Generating your images...</p>
                    <p className="text-muted-foreground text-xs">This may take 10–20 seconds</p>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((img, index) => (
                    <div
                      key={index}
                      className={cn(
                        "relative group rounded-xl overflow-hidden border border-border",
                        "opacity-0 animate-scale-in",
                        `stagger-${index + 1}`
                      )}
                    >
                      <img
                        src={img}
                        alt={`Generated ${index + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <Button size="sm" variant="secondary" onClick={() => handleDownload(img, index)}>
                            <Download className="w-4 h-4 mr-2" />Download
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setExpandedImg(img)}>
                            <Maximize className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 rounded-xl bg-secondary/30 border border-dashed border-border flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Your generated images will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Settings Panel ── */}
          <div className="space-y-4">

            {/* Style */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Style</h3>
                <Palette className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={cn(
                      "p-3 rounded-xl text-center transition-all",
                      selectedStyle.id === style.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 border border-transparent hover:bg-secondary"
                    )}
                  >
                    <span className="text-2xl mb-1 block">{style.icon}</span>
                    <span className="text-xs font-medium text-foreground">{style.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Aspect Ratio</h3>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio)}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      selectedRatio.id === ratio.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 border border-transparent hover:bg-secondary"
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">{ratio.id}</p>
                    <p className="text-xs text-muted-foreground">{ratio.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Advanced</h3>
                <Settings className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Number of Images</span>
                  <span className="text-sm font-medium text-foreground">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Style</span>
                  <span className="text-sm font-medium text-foreground">{selectedStyle.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ratio</span>
                  <span className="text-sm font-medium text-foreground">{selectedRatio.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Saved to Supabase</span>
                  <span className="text-sm font-medium text-green-400">{userId ? "✅ Yes" : "⏳ Loading"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Image Modal */}
        {expandedImg && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setExpandedImg(null)}
          >
            <img
              src={expandedImg}
              alt="Expanded"
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
            />
          </div>
        )}

      </main>
    </div>
  );
};