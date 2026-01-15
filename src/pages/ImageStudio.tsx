import { useState } from "react";
import { 
  Image, 
  Wand2, 
  Download, 
  RefreshCw,
  Maximize,
  Grid3X3,
  Settings,
  Sparkles,
  Palette
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const styles = [
  { id: "photorealistic", name: "Photorealistic", icon: "📷" },
  { id: "editorial", name: "Editorial", icon: "📰" },
  { id: "illustration", name: "Illustration", icon: "🎨" },
  { id: "minimalist", name: "Minimalist", icon: "⬜" },
  { id: "dramatic", name: "Dramatic", icon: "🎭" },
  { id: "infographic", name: "Infographic", icon: "📊" },
];

const aspectRatios = [
  { id: "1:1", name: "Square", width: 1024, height: 1024 },
  { id: "16:9", name: "Landscape", width: 1920, height: 1080 },
  { id: "9:16", name: "Portrait", width: 1080, height: 1920 },
  { id: "4:3", name: "Standard", width: 1200, height: 900 },
];

const mockGeneratedImages = [
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=400&fit=crop",
];

export const ImageStudio = () => {
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [selectedRatio, setSelectedRatio] = useState(aspectRatios[0]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedImages(mockGeneratedImages);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <Header title="Image Creation" subtitle="Generate stunning visuals with AI" />
      
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generation Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Prompt Input */}
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
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Enhance Prompt
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Random
                  </Button>
                </div>
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Images
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Generated Images Grid */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Generated Images</h3>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid View
                </Button>
              </div>
              
              {generatedImages.length > 0 ? (
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
                          <Button size="sm" variant="secondary">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="secondary">
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

          {/* Settings Panel */}
          <div className="space-y-4">
            {/* Style Selection */}
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

            {/* Advanced Settings */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Advanced</h3>
                <Settings className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Number of Images</span>
                  <span className="text-sm font-medium text-foreground">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quality</span>
                  <span className="text-sm font-medium text-foreground">High</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Seed</span>
                  <span className="text-sm font-medium text-foreground">Random</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
