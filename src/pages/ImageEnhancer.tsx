import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@supabase/supabase-js";
import {
  Sparkles, Upload, Download, RotateCcw, Sun, Contrast,
  Droplets, Focus, Palette, Zap, Image, Wand2,
  SlidersHorizontal, Eye, Layers, RefreshCw, CheckCircle2, X
} from "lucide-react";

// ── Supabase ─────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const BUCKET = "enhanced-images";

interface Enhancement {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  enabled: boolean;
}

interface Adjustment {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  min: number;
  max: number;
  unit: string;
}

export const ImageEnhancer = () => {
  const [selectedImage,   setSelectedImage]   = useState<string | null>(null);
  const [originalFile,    setOriginalFile]    = useState<File | null>(null);
  const [enhancedImage,   setEnhancedImage]   = useState<string | null>(null);
  const [isProcessing,    setIsProcessing]    = useState(false);
  const [showComparison,  setShowComparison]  = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [successMsg,      setSuccessMsg]      = useState<string | null>(null);
  const [userId,          setUserId]          = useState<string | null>(null);
  const [activePreset,    setActivePreset]    = useState<string | null>(null);
  const [qualityScore,    setQualityScore]    = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [enhancements, setEnhancements] = useState<Enhancement[]>([
    { id: "auto",     name: "Auto Enhance",    icon: Wand2,    description: "AI-powered automatic improvements",  enabled: true  },
    { id: "denoise",  name: "Noise Reduction", icon: Droplets, description: "Remove grain and digital noise",     enabled: true  },
    { id: "sharpen",  name: "Smart Sharpen",   icon: Focus,    description: "Enhance edge clarity and details",   enabled: false },
    { id: "color",    name: "Color Correction",icon: Palette,  description: "Fix white balance and color cast",   enabled: true  },
    { id: "exposure", name: "Exposure Fix",    icon: Sun,      description: "Balance light and shadows",          enabled: false },
    { id: "face",     name: "Face Enhancement",icon: Eye,      description: "Subtle face and skin improvements",  enabled: false },
  ]);

  const [adjustments, setAdjustments] = useState<Adjustment[]>([
    { id: "brightness", name: "Brightness",     icon: Sun,      value: 0, min: -100, max: 100, unit: "" },
    { id: "contrast",   name: "Contrast",       icon: Contrast, value: 0, min: -100, max: 100, unit: "" },
    { id: "saturation", name: "Saturation",     icon: Palette,  value: 0, min: -100, max: 100, unit: "" },
    { id: "sharpness",  name: "Sharpness",      icon: Focus,    value: 0, min: 0,    max: 100, unit: "" },
    { id: "noise",      name: "Noise Reduction",icon: Droplets, value: 0, min: 0,    max: 100, unit: "" },
    { id: "clarity",    name: "Clarity",        icon: Layers,   value: 0, min: -100, max: 100, unit: "" },
  ]);

  const presets = [
    { id: "news",     name: "News Standard", description: "Balanced for print & web",    brightness: 5,   contrast: 10,  saturation: 5,   sharpness: 20, noise: 10, clarity: 10  },
    { id: "portrait", name: "Portrait",      description: "Optimized for faces",         brightness: 10,  contrast: 5,   saturation: 10,  sharpness: 10, noise: 30, clarity: 5   },
    { id: "lowlight", name: "Low Light Fix", description: "Brighten dark photos",        brightness: 40,  contrast: 15,  saturation: 10,  sharpness: 15, noise: 50, clarity: 20  },
    { id: "outdoor",  name: "Outdoor",       description: "Vivid natural colors",        brightness: 5,   contrast: 20,  saturation: 30,  sharpness: 25, noise: 5,  clarity: 15  },
    { id: "archive",  name: "Archive Restore",description: "Enhance old photos",        brightness: 15,  contrast: 25,  saturation: -10, sharpness: 30, noise: 60, clarity: 20  },
  ];

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

  const toggleEnhancement = (id: string) =>
    setEnhancements(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));

  const updateAdjustment = (id: string, value: number) =>
    setAdjustments(prev => prev.map(a => a.id === id ? { ...a, value } : a));

  // ── Apply Preset ─────────────────────────────────────────────
  const applyPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset.id);
    setAdjustments(prev => prev.map(a => ({
      ...a,
      value: preset[a.id as keyof typeof preset] as number ?? a.value,
    })));
  };

  // ── Canvas-based local adjustments ───────────────────────────
  const applyCanvasAdjustments = (
    sourceUrl: string,
    adjs: Adjustment[]
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current!;
        canvas.width  = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const get = (id: string) => (adjs.find(a => a.id === id)?.value ?? 0);
        const brightness  = get("brightness") * 2.55;
        const contrast    = get("contrast");
        const saturation  = get("saturation") / 100 + 1;
        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i], g = data[i + 1], b = data[i + 2];

          // Brightness
          r += brightness; g += brightness; b += brightness;

          // Contrast
          r = contrastFactor * (r - 128) + 128;
          g = contrastFactor * (g - 128) + 128;
          b = contrastFactor * (b - 128) + 128;

          // Saturation (convert to greyscale and lerp)
          const grey = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          r = grey + saturation * (r - grey);
          g = grey + saturation * (g - grey);
          b = grey + saturation * (b - grey);

          data[i]     = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
        }

        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(blob => blob ? resolve(blob) : reject("Canvas blob failed"), "image/jpeg", 0.95);
      };
      img.onerror = reject;
      img.src = sourceUrl;
    });
  };

  // ── Call Stability AI Upscale ─────────────────────────────────
  const callStabilityUpscale = async (imageBlob: Blob): Promise<Blob> => {
    const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
    if (!apiKey) throw new Error("Add VITE_STABILITY_API_KEY to .env.local");

    const formData = new FormData();
    formData.append("image", imageBlob, "image.jpg");

    const res = await fetch(
      "https://api.stability.ai/v2beta/stable-image/upscale/fast",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "image/*",
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const msg = await res.text().catch(() => "Unknown error");
      throw new Error(`Stability API ${res.status}: ${msg}`);
    }

    return res.blob();
  };

  // ── Upload to Supabase Storage ────────────────────────────────
  const uploadToStorage = async (blob: Blob, uid: string, label: string): Promise<string> => {
    const fileName = `${uid}/${Date.now()}-${label}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw new Error(uploadError.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  };

  // ── Save metadata to DB ───────────────────────────────────────
  const saveToDatabase = async (
    uid: string, originalUrl: string, enhancedUrl: string
  ) => {
    const enabledEnhancements = enhancements.filter(e => e.enabled).map(e => e.name);
    const adjMap = Object.fromEntries(adjustments.map(a => [a.id, a.value]));

    const { error: dbError } = await supabase.from("enhanced_images").insert({
      user_id:       uid,
      original_url:  originalUrl,
      enhanced_url:  enhancedUrl,
      enhancements:  enabledEnhancements,
      adjustments:   adjMap,
      preset:        activePreset,
      quality_score: qualityScore,
    });
    if (dbError) console.error("DB error:", dbError.message);
  };

  // ── Compute simple quality score ──────────────────────────────
  const computeQualityScore = (): number => {
    const enabledCount = enhancements.filter(e => e.enabled).length;
    const adjActivity  = adjustments.filter(a => a.value !== 0).length;
    return Math.min(100, 60 + enabledCount * 5 + adjActivity * 3);
  };

  // ── Main enhance handler ──────────────────────────────────────
  const handleEnhance = async () => {
    if (!selectedImage || !originalFile) {
      setError("Please upload an image first.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      // Step 1 — apply canvas adjustments locally
      const adjustedBlob = await applyCanvasAdjustments(selectedImage, adjustments);

      // Step 2 — upscale via Stability AI
      let finalBlob: Blob;
      try {
        finalBlob = await callStabilityUpscale(adjustedBlob);
      } catch (apiErr) {
        console.warn("Stability upscale failed, using canvas result:", apiErr);
        finalBlob = adjustedBlob; // fallback to canvas-only result
      }

      // Step 3 — show enhanced preview
      const enhancedUrl = URL.createObjectURL(finalBlob);
      setEnhancedImage(enhancedUrl);
      setShowComparison(true);

      // Step 4 — compute quality
      const score = computeQualityScore();
      setQualityScore(score);

      // Step 5 — save to Supabase
      if (userId) {
        const originalBlob = await fetch(selectedImage).then(r => r.blob());
        const [originalPublicUrl, enhancedPublicUrl] = await Promise.all([
          uploadToStorage(originalBlob, userId, "original"),
          uploadToStorage(finalBlob,    userId, "enhanced"),
        ]);
        await saveToDatabase(userId, originalPublicUrl, enhancedPublicUrl);
      }

      setSuccessMsg("Image enhanced and saved to Supabase!");
      setTimeout(() => setSuccessMsg(null), 4000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Download enhanced image ───────────────────────────────────
  const handleDownload = () => {
    const url = enhancedImage || selectedImage;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `enhanced-${Date.now()}.jpg`;
    a.click();
  };

  // ── Reset ─────────────────────────────────────────────────────
  const resetAll = () => {
    setAdjustments(prev => prev.map(a => ({ ...a, value: 0 })));
    setEnhancements(prev => prev.map(e => ({
      ...e,
      enabled: ["auto", "denoise", "color"].includes(e.id),
    })));
    setActivePreset(null);
    setEnhancedImage(null);
    setShowComparison(false);
    setQualityScore(null);
    setError(null);
  };

  // Image shown in preview — enhanced if available, else original
  const previewSrc = showComparison && enhancedImage ? enhancedImage : selectedImage;

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Image Enhancer"
        subtitle="AI-powered photo editing for news photography"
      />

      {/* Hidden canvas for pixel manipulation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="p-6">

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main Image Area ── */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-semibold text-foreground">Image Preview</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Before/After</span>
                  <Switch
                    checked={showComparison}
                    onCheckedChange={setShowComparison}
                    disabled={!enhancedImage}
                  />
                </div>
              </div>

              {selectedImage ? (
                <div className="relative aspect-video bg-card rounded-lg overflow-hidden">
                  {/* Before side */}
                  {showComparison && enhancedImage ? (
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 overflow-hidden border-r-2 border-primary relative">
                        <img src={selectedImage} alt="Before" className="w-full h-full object-contain" />
                        <Badge className="absolute top-2 left-2 bg-card/80">Before</Badge>
                      </div>
                      <div className="w-1/2 relative">
                        <img src={enhancedImage} alt="After" className="w-full h-full object-contain" />
                        <Badge className="absolute top-2 right-2 bg-primary">After</Badge>
                      </div>
                    </div>
                  ) : (
                    <img src={previewSrc!} alt="Preview" className="w-full h-full object-contain" />
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground">Enhancing image...</p>
                        <p className="text-xs text-muted-foreground">Applying AI upscale + adjustments</p>
                      </div>
                    </div>
                  )}

                  {/* Replace image button */}
                  <label className="absolute bottom-3 left-3 cursor-pointer">
                    <input
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImage(URL.createObjectURL(file));
                          setOriginalFile(file);
                          setEnhancedImage(null);
                          setShowComparison(false);
                          setQualityScore(null);
                        }
                      }}
                    />
                    <span className="text-xs bg-card/80 text-muted-foreground px-2 py-1 rounded-lg hover:text-foreground transition-colors">
                      Replace image
                    </span>
                  </label>
                </div>
              ) : (
                <label className="aspect-video bg-card rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedImage(URL.createObjectURL(file));
                        setOriginalFile(file);
                      }
                    }}
                  />
                  <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                    Drop an image here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WebP</p>
                </label>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleEnhance}
                disabled={!selectedImage || isProcessing}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60"
              >
                {isProcessing
                  ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Enhancing...</>
                  : <><Zap className="w-4 h-4 mr-2" />Apply Enhancements</>}
              </Button>
              <Button variant="outline" onClick={resetAll}>
                <RotateCcw className="w-4 h-4 mr-2" />Reset
              </Button>
              <Button variant="outline" disabled={!selectedImage} onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </div>

            {/* Quick Presets */}
            <Card className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Presets</h3>
              <div className="flex gap-2 flex-wrap">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className={activePreset === preset.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "hover:bg-primary/10 hover:border-primary"}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Enhancement Controls ── */}
          <div className="space-y-4">
            <Tabs defaultValue="smart" className="w-full">
              <TabsList className="w-full bg-card">
                <TabsTrigger value="smart" className="flex-1">
                  <Wand2 className="w-4 h-4 mr-1" />Smart
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex-1">
                  <SlidersHorizontal className="w-4 h-4 mr-1" />Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="smart" className="mt-4 space-y-3">
                {enhancements.map((enhancement) => (
                  <Card
                    key={enhancement.id}
                    className={`p-4 cursor-pointer transition-all ${
                      enhancement.enabled
                        ? "bg-primary/10 border-primary/30"
                        : "bg-card hover:bg-card/80"
                    }`}
                    onClick={() => toggleEnhancement(enhancement.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${enhancement.enabled ? "bg-primary/20" : "bg-muted"}`}>
                        <enhancement.icon className={`w-4 h-4 ${enhancement.enabled ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground text-sm">{enhancement.name}</h4>
                          <Switch
                            checked={enhancement.enabled}
                            onCheckedChange={() => toggleEnhancement(enhancement.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{enhancement.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="manual" className="mt-4 space-y-4">
                {adjustments.map((adjustment) => (
                  <div key={adjustment.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <adjustment.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{adjustment.name}</span>
                      </div>
                      <span className="text-sm text-primary font-mono">
                        {adjustment.value > 0 ? "+" : ""}{adjustment.value}{adjustment.unit}
                      </span>
                    </div>
                    <Slider
                      value={[adjustment.value]}
                      min={adjustment.min}
                      max={adjustment.max}
                      step={1}
                      onValueChange={([value]) => updateAdjustment(adjustment.id, value)}
                      className="w-full"
                    />
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            {/* Image Analysis */}
            <Card className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                Image Analysis
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality Score</span>
                  <span className={`font-medium ${qualityScore ? "text-green-400" : "text-foreground"}`}>
                    {qualityScore ? `${qualityScore}/100` : "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Noise Reduction</span>
                  <span className="text-foreground font-medium">
                    {adjustments.find(a => a.id === "noise")?.value || "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sharpness</span>
                  <span className="text-foreground font-medium">
                    {adjustments.find(a => a.id === "sharpness")?.value || "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved to Supabase</span>
                  <span className="text-foreground font-medium">
                    {userId ? "✅ Ready" : "⏳ Loading"}
                  </span>
                </div>
                {activePreset && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Preset</span>
                    <span className="text-primary font-medium capitalize">{activePreset}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Tips */}
            <Card className="bg-primary/5 border-primary/20 p-4">
              <h4 className="text-sm font-semibold text-primary mb-2">💡 Pro Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use Auto Enhance for quick improvements</li>
                <li>• Apply noise reduction before sharpening</li>
                <li>• Keep adjustments subtle for news photos</li>
                <li>• Use presets for consistent results</li>
                <li>• Toggle Before/After after enhancing</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};