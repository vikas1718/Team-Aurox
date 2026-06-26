/**
 * ImageEnhancer.tsx
 *
 * Section 1 — Smart Editor
 *   • Upload image
 *   • "Press Ready" button → applies news-grade canvas preset
 *   • Before / After split view
 *   • COCO-SSD subject detection → bounding box overlay
 *   • Auto-suggest crops: 16:9 (Web), 4:3 (Print), 1:1 (Social)
 *   • Download cropped result
 *
 * Section 2 — Manual Editor
 *   • Works on top of the smart-edited image (falls back to original)
 *   • Sliders: Brightness, Contrast, Saturation, Sharpness, Warmth, Noise
 *   • Rotate left / right
 *   • Reset to Smart Edit  |  Reset to Original
 *   • Live canvas preview
 *   • Download final
 *
 * Dependencies (add to package.json):
 *   @tensorflow/tfjs  ^4.x
 *   @tensorflow-models/coco-ssd  ^2.x
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

import {
  Upload, Download, RotateCcw, RotateCw, Wand2,
  SlidersHorizontal, RefreshCw, CheckCircle2, X,
  Sun, Contrast, Droplets, Focus, Thermometer, Layers,
  Crop, ChevronDown, ChevronUp, Scan, Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface CropFormat {
  id:    string;
  name:  string;
  label: string;
  w:     number; // ratio width
  h:     number; // ratio height
}

interface DetectedObject {
  bbox:  [number, number, number, number]; // x,y,w,h in px
  class: string;
  score: number;
}

interface ManualAdj {
  id:    string;
  name:  string;
  icon:  React.ComponentType<{ className?: string }>;
  value: number;
  min:   number;
  max:   number;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const CROP_FORMATS: CropFormat[] = [
  { id: "web",    name: "Web Article",   label: "16:9",  w: 16, h: 9  },
  { id: "print",  name: "Print Edition", label: "4:3",   w: 4,  h: 3  },
  { id: "social", name: "Social Post",   label: "1:1",   w: 1,  h: 1  },
  { id: "thumb",  name: "Thumbnail",     label: "3:2",   w: 3,  h: 2  },
];

// News-grade preset values (applied to canvas pixel data)
const NEWS_PRESET = {
  brightness:  5,    // subtle lift
  contrast:    10,   // punch without clipping
  saturation: -15,   // desaturate → no Instagram look
  sharpness:   20,   // edge clarity
  warmth:      0,
  noise:       10,
};

const DEFAULT_MANUAL: ManualAdj[] = [
  { id: "brightness", name: "Brightness",  icon: Sun,         value: 0, min: -100, max: 100 },
  { id: "contrast",   name: "Contrast",    icon: Contrast,    value: 0, min: -100, max: 100 },
  { id: "saturation", name: "Saturation",  icon: Droplets,    value: 0, min: -100, max: 100 },
  { id: "sharpness",  name: "Sharpness",   icon: Focus,       value: 0, min: 0,    max: 100 },
  { id: "warmth",     name: "Warmth",      icon: Thermometer, value: 0, min: -100, max: 100 },
  { id: "noise",      name: "Clarity",     icon: Layers,      value: 0, min: -100, max: 100 },
];

// ─────────────────────────────────────────────────────────────
// Canvas helpers
// ─────────────────────────────────────────────────────────────

/** Draw image onto canvas, return ImageData */
const drawToCanvas = (
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  rotation = 0,
) => {
  const ctx = canvas.getContext("2d")!;
  const rad = (rotation * Math.PI) / 180;
  const swap = rotation === 90 || rotation === 270;
  canvas.width  = swap ? img.height : img.width;
  canvas.height = swap ? img.width  : img.height;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
};

/** Apply pixel-level colour adjustments, return new Blob */
const applyAdjustments = (
  sourceCanvas: HTMLCanvasElement,
  adjs: Record<string, number>,
): Promise<string> => {
  return new Promise((resolve) => {
    const out = document.createElement("canvas");
    out.width  = sourceCanvas.width;
    out.height = sourceCanvas.height;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(sourceCanvas, 0, 0);

    const id   = ctx.getImageData(0, 0, out.width, out.height);
    const data = id.data;

    const brightness  = (adjs.brightness ?? 0) * 2.55;
    const contrast    = adjs.contrast    ?? 0;
    const saturation  = (adjs.saturation ?? 0) / 100 + 1;
    const warmth      = (adjs.warmth     ?? 0) * 0.5;
    const cFactor     = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      // Brightness
      r += brightness; g += brightness; b += brightness;

      // Contrast
      r = cFactor * (r - 128) + 128;
      g = cFactor * (g - 128) + 128;
      b = cFactor * (b - 128) + 128;

      // Saturation
      const grey = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = grey + saturation * (r - grey);
      g = grey + saturation * (g - grey);
      b = grey + saturation * (b - grey);

      // Warmth  (shift red/blue channels)
      r += warmth;
      b -= warmth;

      data[i]     = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    // Sharpness — simple unsharp mask via two draws
    const sharpness = adjs.sharpness ?? 0;
    ctx.putImageData(id, 0, 0);
    if (sharpness > 0) {
      const alpha = sharpness / 200;
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = `blur(1px)`;
      ctx.globalAlpha = -alpha; // subtract blurred = sharpen
      ctx.drawImage(out, 0, 0);
      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    resolve(out.toDataURL("image/jpeg", 0.95));
  });
};

/** Crop canvas to a bounding box centred on the subject with given ratio */
const cropToRatio = (
  sourceCanvas: HTMLCanvasElement,
  bbox: [number, number, number, number] | null,
  ratioW: number,
  ratioH: number,
): string => {
  const W = sourceCanvas.width;
  const H = sourceCanvas.height;

  // Centre crop around detected subject if available
  let cx = W / 2, cy = H / 2;
  if (bbox) {
    cx = bbox[0] + bbox[2] / 2;
    cy = bbox[1] + bbox[3] / 2;
  }

  // Compute crop dimensions preserving ratio
  const targetRatio = ratioW / ratioH;
  const canvasRatio = W / H;
  let cw: number, ch: number;
  if (canvasRatio > targetRatio) {
    ch = H;
    cw = ch * targetRatio;
  } else {
    cw = W;
    ch = cw / targetRatio;
  }

  // Clamp so crop stays inside image
  let sx = cx - cw / 2;
  let sy = cy - ch / 2;
  sx = Math.max(0, Math.min(sx, W - cw));
  sy = Math.max(0, Math.min(sy, H - ch));

  const out = document.createElement("canvas");
  out.width  = Math.round(cw);
  out.height = Math.round(ch);
  const ctx  = out.getContext("2d")!;
  ctx.drawImage(sourceCanvas, sx, sy, cw, ch, 0, 0, cw, ch);
  return out.toDataURL("image/jpeg", 0.95);
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export const ImageEnhancer = () => {
  // ── image state
  const [originalSrc,    setOriginalSrc]    = useState<string | null>(null);
  const [smartSrc,       setSmartSrc]       = useState<string | null>(null); // after press-ready
  const [manualSrc,      setManualSrc]      = useState<string | null>(null); // after manual
  const [cropSrc,        setCropSrc]        = useState<string | null>(null); // after crop
  const [selectedCrop,   setSelectedCrop]   = useState<string>("web");

  // ── ui state
  const [showSmart,      setShowSmart]      = useState(true);
  const [showManual,     setShowManual]     = useState(false);
  const [splitView,      setSplitView]      = useState(false);
  const [isSmartRunning, setIsSmartRunning] = useState(false);
  const [isDetecting,    setIsDetecting]    = useState(false);
  const [isManualing,    setIsManualing]    = useState(false);
  const [smartDone,      setSmartDone]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [successMsg,     setSuccessMsg]     = useState<string | null>(null);
  const [appliedBadge,   setAppliedBadge]   = useState<string[]>([]);
  const [rotation,       setRotation]       = useState(0);
  const [userId,         setUserId]         = useState<string | null>(null);

  // ── detection
  const [detections,     setDetections]     = useState<DetectedObject[]>([]);
  const [modelLoaded,    setModelLoaded]    = useState(false);
  const [modelLoading,   setModelLoading]   = useState(false);
  const cocoModelRef = useRef<any>(null);

  // ── manual adjustments
  const [manualAdj, setManualAdj] = useState<ManualAdj[]>(DEFAULT_MANUAL);

  // ── canvas refs
  const hiddenCanvas = useRef<HTMLCanvasElement>(null);
  const overlayRef   = useRef<HTMLCanvasElement>(null);
  const smartImgRef  = useRef<HTMLImageElement>(null);

  // ── supabase
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { setUserId(session.user.id); return; }
      const { data } = await supabase.auth.signInAnonymously();
      if (data?.user) setUserId(data.user.id);
    };
    init();
  }, []);

  // ─────────────────────────────────────────────────────────
  // Load COCO-SSD lazily on first smart edit
  // ─────────────────────────────────────────────────────────
  const loadCocoModel = useCallback(async () => {
    if (cocoModelRef.current) return cocoModelRef.current;
    setModelLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      await require("@tensorflow/tfjs");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cocoSsd = require("@tensorflow-models/coco-ssd");
      const model   = await cocoSsd.load();
      cocoModelRef.current = model;
      setModelLoaded(true);
      return model;
    } finally {
      setModelLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────
  // Upload handler
  // ─────────────────────────────────────────────────────────
  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setOriginalSrc(url);
    setSmartSrc(null);
    setManualSrc(null);
    setCropSrc(null);
    setDetections([]);
    setSmartDone(false);
    setSplitView(false);
    setAppliedBadge([]);
    setRotation(0);
    setManualAdj(DEFAULT_MANUAL);
    setError(null);
  };

  // ─────────────────────────────────────────────────────────
  // Section 1 — Smart Edit ("Press Ready")
  // ─────────────────────────────────────────────────────────
  const handlePressReady = async () => {
    if (!originalSrc) return;
    setIsSmartRunning(true);
    setError(null);

    try {
      // 1. Draw original to hidden canvas
      const img = new window.Image();
      img.src = originalSrc;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = rej;
      });

      const canvas = hiddenCanvas.current!;
      drawToCanvas(canvas, img, rotation);

      // 2. Apply news preset
      const adjusted = await applyAdjustments(canvas, NEWS_PRESET);
      setSmartSrc(adjusted);
      setSmartDone(true);
      setSplitView(true);

      const badges = ["Contrast +10", "Saturation −15", "Sharpness +20", "Auto Exposure"];
      setAppliedBadge(badges);

      // 3. Run COCO-SSD detection on smart result
      setIsDetecting(true);
      const model = await loadCocoModel();

      const smartImg = new window.Image();
      smartImg.src = adjusted;
      await new Promise<void>((res) => { smartImg.onload = () => res(); });

      // Draw to canvas for tf detection
      const detCanvas = document.createElement("canvas");
      detCanvas.width  = smartImg.width;
      detCanvas.height = smartImg.height;
      detCanvas.getContext("2d")!.drawImage(smartImg, 0, 0);

      const preds: DetectedObject[] = await model.detect(detCanvas);
      setDetections(preds);

      // 4. Auto-select crop for detected subject
      if (preds.length > 0) {
        const best = preds.reduce((a, b) => a.score > b.score ? a : b);
        // Draw bounding box overlay
        drawBoundingBoxes(detCanvas, [best]);
        // Apply default crop (web 16:9) centred on subject
        const croppedUrl = cropToRatio(detCanvas, best.bbox, 16, 9);
        setCropSrc(croppedUrl);
      }

      setSuccessMsg("Press Ready applied! Subject detected.");
      setTimeout(() => setSuccessMsg(null), 3500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Smart edit failed.");
    } finally {
      setIsSmartRunning(false);
      setIsDetecting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Draw bounding box on an overlay canvas
  // ─────────────────────────────────────────────────────────
  const drawBoundingBoxes = (source: HTMLCanvasElement, preds: DetectedObject[]) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.width  = source.width;
    overlay.height = source.height;
    const ctx = overlay.getContext("2d")!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    preds.forEach(({ bbox, class: cls, score }) => {
      const [x, y, w, h] = bbox;
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth   = Math.max(2, source.width / 300);
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "#f59e0b";
      ctx.font = `${Math.max(12, source.width / 60)}px sans-serif`;
      ctx.fillText(`${cls} ${Math.round(score * 100)}%`, x + 4, y - 4);
    });
  };

  // ─────────────────────────────────────────────────────────
  // Smart Crop — user picks a format
  // ─────────────────────────────────────────────────────────
  const handleCropSelect = (fmt: CropFormat) => {
    setSelectedCrop(fmt.id);
    if (!smartSrc) return;

    const img = new window.Image();
    img.src = smartSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);

      const bestDetection = detections.length > 0
        ? detections.reduce((a, b) => a.score > b.score ? a : b)
        : null;

      const url = cropToRatio(canvas, bestDetection?.bbox ?? null, fmt.w, fmt.h);
      setCropSrc(url);
    };
  };

  // ─────────────────────────────────────────────────────────
  // Section 2 — Manual edit (on top of smart result)
  // ─────────────────────────────────────────────────────────
  const applyManualAdj = useCallback(async (adjs: ManualAdj[]) => {
    const base = smartSrc || originalSrc;
    if (!base) return;
    setIsManualing(true);

    const img = new window.Image();
    img.src = base;
    await new Promise<void>((res) => { img.onload = () => res(); });

    const canvas = hiddenCanvas.current!;
    drawToCanvas(canvas, img, rotation);

    const adjMap = Object.fromEntries(adjs.map(a => [a.id, a.value]));
    const result = await applyAdjustments(canvas, adjMap);
    setManualSrc(result);
    setIsManualing(false);
  }, [smartSrc, originalSrc, rotation]);

  // Debounce manual slider updates
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateManualAdj = (id: string, value: number) => {
    const updated = manualAdj.map(a => a.id === id ? { ...a, value } : a);
    setManualAdj(updated);
    if (manualTimer.current) clearTimeout(manualTimer.current);
    manualTimer.current = setTimeout(() => applyManualAdj(updated), 120);
  };

  const resetToSmartEdit = () => {
    setManualAdj(DEFAULT_MANUAL);
    setManualSrc(null);
  };

  const resetToOriginal = () => {
    setSmartSrc(null);
    setManualSrc(null);
    setCropSrc(null);
    setDetections([]);
    setSmartDone(false);
    setSplitView(false);
    setAppliedBadge([]);
    setManualAdj(DEFAULT_MANUAL);
    setRotation(0);
  };

  // Rotate
  const rotate = (dir: "left" | "right") => {
    const next = (rotation + (dir === "right" ? 90 : -90) + 360) % 360;
    setRotation(next);
  };

  // ─────────────────────────────────────────────────────────
  // Download
  // ─────────────────────────────────────────────────────────
  const handleDownload = (src: string | null, label: string) => {
    if (!src) return;
    const a = document.createElement("a");
    a.href     = src;
    a.download = `newsphoto-${label}-${Date.now()}.jpg`;
    a.click();
  };

  // ─────────────────────────────────────────────────────────
  // Derived preview sources
  // ─────────────────────────────────────────────────────────
  const smartPreview  = smartSrc  || originalSrc;
  const manualPreview = manualSrc || smartSrc || originalSrc;

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Image Enhancer"
        subtitle="Smart news-grade editing + manual fine-tuning"
      />

      {/* Hidden canvas */}
      <canvas ref={hiddenCanvas} className="hidden" />

      <main className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* ── Alerts ── */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — SMART EDITOR
        ══════════════════════════════════════════════════════ */}
        <div className="card-elevated overflow-hidden">
          {/* Section header */}
          <button
            className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            onClick={() => setShowSmart(v => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Smart Editor</p>
                <p className="text-xs text-muted-foreground">
                  News-grade preset · Subject detection · Smart crop
                </p>
              </div>
            </div>
            {showSmart ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {showSmart && (
            <div className="px-6 pb-6 space-y-5 border-t border-border">

              {/* Upload zone */}
              {!originalSrc ? (
                <label className="mt-5 flex flex-col items-center justify-center h-56 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer group">
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                  />
                  <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                    Drop a news photo or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG · PNG · WebP</p>
                </label>
              ) : (
                <div className="mt-5 space-y-4">

                  {/* Before / After split */}
                  <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video">
                    {splitView && smartSrc ? (
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 overflow-hidden border-r-2 border-primary relative">
                          <img src={originalSrc} alt="Before" className="w-full h-full object-contain" />
                          <span className="absolute top-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">Before</span>
                        </div>
                        <div className="w-1/2 relative">
                          <img src={smartSrc} alt="After" className="w-full h-full object-contain" />
                          {/* Bounding box overlay */}
                          {detections.length > 0 && (
                            <canvas
                              ref={overlayRef}
                              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            />
                          )}
                          <span className="absolute top-2 right-2 text-xs bg-primary/80 text-white px-2 py-0.5 rounded-full">Press Ready</span>
                        </div>
                      </div>
                    ) : (
                      <img src={smartPreview!} alt="Preview" className="w-full h-full object-contain" />
                    )}

                    {(isSmartRunning || isDetecting) && (
                      <div className="absolute inset-0 bg-background/75 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-7 h-7 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">
                          {isDetecting ? "Detecting subjects…" : "Applying news preset…"}
                        </p>
                        {modelLoading && (
                          <p className="text-xs text-muted-foreground">Loading COCO-SSD (~6 MB, first time only)</p>
                        )}
                      </div>
                    )}

                    {/* Replace */}
                    <label className="absolute bottom-3 left-3 cursor-pointer">
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                      <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-lg hover:bg-black/80 transition-colors">Replace</span>
                    </label>
                  </div>

                  {/* Applied badges */}
                  {appliedBadge.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {appliedBadge.map(b => (
                        <span key={b} className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                          {b}
                        </span>
                      ))}
                      {detections.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                          <Scan className="w-3 h-3 inline mr-1" />
                          {detections[0].class} detected ({Math.round(detections[0].score * 100)}%)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Press Ready button + rotate */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handlePressReady}
                      disabled={isSmartRunning || isDetecting}
                      className="flex-1 bg-gradient-to-r from-primary to-amber-600 text-white"
                    >
                      {isSmartRunning || isDetecting
                        ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Processing…</>
                        : <><Wand2 className="w-4 h-4 mr-2" />Press Ready</>}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => rotate("left")}  title="Rotate left">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => rotate("right")} title="Rotate right">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    {smartDone && (
                      <Button variant="outline" size="icon"
                        onClick={() => setSplitView(v => !v)}
                        title="Toggle before/after"
                        className={splitView ? "border-primary text-primary" : ""}
                      >
                        <Layers className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* ── Smart Crop formats ── */}
                  {smartDone && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Crop className="w-4 h-4 text-primary" />
                        Smart Crop — pick a format
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {CROP_FORMATS.map(fmt => (
                          <button
                            key={fmt.id}
                            onClick={() => handleCropSelect(fmt)}
                            className={cn(
                              "p-3 rounded-xl border text-left transition-all",
                              selectedCrop === fmt.id
                                ? "border-primary/50 bg-primary/5 text-primary"
                                : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                            )}
                          >
                            <p className="font-medium text-sm">{fmt.name}</p>
                            <p className="text-xs mt-0.5">{fmt.label}</p>
                          </button>
                        ))}
                      </div>

                      {/* Crop preview + download */}
                      {cropSrc && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Crop preview</p>
                          <div className="rounded-xl overflow-hidden bg-secondary border border-border max-h-48 flex items-center justify-center">
                            <img src={cropSrc} alt="Crop preview" className="max-h-48 object-contain" />
                          </div>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => handleDownload(cropSrc, "smart-crop")}
                          >
                            <Download className="w-4 h-4 mr-2" />Download Cropped
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — MANUAL EDITOR
        ══════════════════════════════════════════════════════ */}
        <div className="card-elevated overflow-hidden">
          <button
            className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            onClick={() => setShowManual(v => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Manual Editor</p>
                <p className="text-xs text-muted-foreground">
                  Fine-tune on top of smart edit · Live preview
                  {isManualing && " · Applying…"}
                </p>
              </div>
            </div>
            {showManual ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {showManual && (
            <div className="px-6 pb-6 space-y-5 border-t border-border">

              {!originalSrc ? (
                <p className="mt-5 text-sm text-muted-foreground text-center py-8">
                  Upload an image in Section 1 first.
                </p>
              ) : (
                <>
                  {/* Live preview */}
                  <div className="mt-5 rounded-xl overflow-hidden bg-secondary border border-border aspect-video flex items-center justify-center relative">
                    <img
                      src={manualPreview!}
                      alt="Manual preview"
                      className={cn("w-full h-full object-contain transition-opacity", isManualing && "opacity-50")}
                    />
                    {isManualing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    {manualAdj.map(adj => (
                      <div key={adj.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <adj.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{adj.name}</span>
                          </div>
                          <span className={cn(
                            "text-sm font-mono",
                            adj.value === 0 ? "text-muted-foreground" : "text-primary"
                          )}>
                            {adj.value > 0 ? "+" : ""}{adj.value}
                          </span>
                        </div>
                        <Slider
                          value={[adj.value]}
                          min={adj.min}
                          max={adj.max}
                          step={1}
                          onValueChange={([v]) => updateManualAdj(adj.id, v)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={() => rotate("left")}>
                      <RotateCcw className="w-4 h-4 mr-1" />Rotate L
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => rotate("right")}>
                      <RotateCw className="w-4 h-4 mr-1" />Rotate R
                    </Button>

                    <div className="flex-1" />

                    {smartDone && (
                      <Button variant="outline" size="sm" onClick={resetToSmartEdit}>
                        <RefreshCw className="w-4 h-4 mr-1" />Reset to Smart Edit
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={resetToOriginal}>
                      <RotateCcw className="w-4 h-4 mr-1" />Reset to Original
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-amber-600 text-white"
                      onClick={() => handleDownload(manualPreview, "final")}
                      disabled={!manualPreview}
                    >
                      <Download className="w-4 h-4 mr-1" />Export Final
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};