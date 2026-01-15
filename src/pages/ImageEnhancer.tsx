import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Upload, 
  Download, 
  RotateCcw, 
  Sun, 
  Contrast, 
  Droplets,
  Focus,
  Palette,
  Zap,
  Image,
  Wand2,
  SlidersHorizontal,
  Eye,
  Layers,
  RefreshCw
} from "lucide-react";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  const [enhancements, setEnhancements] = useState<Enhancement[]>([
    { id: "auto", name: "Auto Enhance", icon: Wand2, description: "AI-powered automatic improvements", enabled: true },
    { id: "denoise", name: "Noise Reduction", icon: Droplets, description: "Remove grain and digital noise", enabled: true },
    { id: "sharpen", name: "Smart Sharpen", icon: Focus, description: "Enhance edge clarity and details", enabled: false },
    { id: "color", name: "Color Correction", icon: Palette, description: "Fix white balance and color cast", enabled: true },
    { id: "exposure", name: "Exposure Fix", icon: Sun, description: "Balance light and shadows", enabled: false },
    { id: "face", name: "Face Enhancement", icon: Eye, description: "Subtle face and skin improvements", enabled: false },
  ]);

  const [adjustments, setAdjustments] = useState<Adjustment[]>([
    { id: "brightness", name: "Brightness", icon: Sun, value: 0, min: -100, max: 100, unit: "" },
    { id: "contrast", name: "Contrast", icon: Contrast, value: 0, min: -100, max: 100, unit: "" },
    { id: "saturation", name: "Saturation", icon: Palette, value: 0, min: -100, max: 100, unit: "" },
    { id: "sharpness", name: "Sharpness", icon: Focus, value: 0, min: 0, max: 100, unit: "" },
    { id: "noise", name: "Noise Reduction", icon: Droplets, value: 0, min: 0, max: 100, unit: "" },
    { id: "clarity", name: "Clarity", icon: Layers, value: 0, min: -100, max: 100, unit: "" },
  ]);

  const presets = [
    { id: "news", name: "News Standard", description: "Balanced for print & web" },
    { id: "portrait", name: "Portrait", description: "Optimized for faces" },
    { id: "lowlight", name: "Low Light Fix", description: "Brighten dark photos" },
    { id: "outdoor", name: "Outdoor", description: "Vivid natural colors" },
    { id: "archive", name: "Archive Restore", description: "Enhance old photos" },
  ];

  const toggleEnhancement = (id: string) => {
    setEnhancements(prev => 
      prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e)
    );
  };

  const updateAdjustment = (id: string, value: number) => {
    setAdjustments(prev =>
      prev.map(a => a.id === id ? { ...a, value } : a)
    );
  };

  const handleEnhance = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const resetAll = () => {
    setAdjustments(prev => prev.map(a => ({ ...a, value: 0 })));
    setEnhancements(prev => prev.map(e => ({ ...e, enabled: e.id === "auto" || e.id === "denoise" || e.id === "color" })));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Image Enhancer" 
        subtitle="AI-powered photo editing for news photography"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Image Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-semibold text-foreground">Image Preview</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Before/After</span>
                    <Switch 
                      checked={showComparison} 
                      onCheckedChange={setShowComparison}
                    />
                  </div>
                </div>
              </div>

              {selectedImage ? (
                <div className="relative aspect-video bg-card rounded-lg overflow-hidden">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                  {showComparison && (
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 overflow-hidden border-r-2 border-primary">
                        <img 
                          src={selectedImage} 
                          alt="Before" 
                          className="w-full h-full object-contain opacity-70"
                        />
                        <Badge className="absolute top-2 left-2 bg-card/80">Before</Badge>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-primary">After</Badge>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Enhancing image...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label className="aspect-video bg-card rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedImage(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                    Drop an image here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JPG, PNG, WebP up to 50MB
                  </p>
                </label>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleEnhance}
                disabled={!selectedImage || isProcessing}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isProcessing ? "Enhancing..." : "Apply Enhancements"}
              </Button>
              <Button variant="outline" onClick={resetAll}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" disabled={!selectedImage}>
                <Download className="w-4 h-4 mr-2" />
                Export
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
                    className="hover:bg-primary/10 hover:border-primary"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Enhancement Controls */}
          <div className="space-y-4">
            <Tabs defaultValue="smart" className="w-full">
              <TabsList className="w-full bg-card">
                <TabsTrigger value="smart" className="flex-1">
                  <Wand2 className="w-4 h-4 mr-1" />
                  Smart
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex-1">
                  <SlidersHorizontal className="w-4 h-4 mr-1" />
                  Manual
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
                      <div className={`p-2 rounded-lg ${
                        enhancement.enabled ? "bg-primary/20" : "bg-muted"
                      }`}>
                        <enhancement.icon className={`w-4 h-4 ${
                          enhancement.enabled ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground text-sm">
                            {enhancement.name}
                          </h4>
                          <Switch 
                            checked={enhancement.enabled}
                            onCheckedChange={() => toggleEnhancement(enhancement.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {enhancement.description}
                        </p>
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
                        <span className="text-sm font-medium text-foreground">
                          {adjustment.name}
                        </span>
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

            {/* Enhancement Stats */}
            <Card className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                Image Analysis
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality Score</span>
                  <span className="text-foreground font-medium">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Noise Level</span>
                  <span className="text-foreground font-medium">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sharpness</span>
                  <span className="text-foreground font-medium">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exposure</span>
                  <span className="text-foreground font-medium">--</span>
                </div>
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
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
