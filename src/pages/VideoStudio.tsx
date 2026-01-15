import { useState } from "react";
import { 
  Video, 
  Play, 
  Pause, 
  Download, 
  Settings,
  Wand2,
  RefreshCw,
  Image,
  Mic2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Scene {
  id: string;
  text: string;
  duration: number;
  imagePrompt: string;
  generatedImage?: string;
}

const videoStyles = [
  { id: "news", name: "News Report", icon: "📺" },
  { id: "documentary", name: "Documentary", icon: "🎬" },
  { id: "explainer", name: "Explainer", icon: "💡" },
  { id: "social", name: "Social Clip", icon: "📱" },
];

const aspectRatios = [
  { id: "16:9", name: "Landscape", desc: "YouTube, Web" },
  { id: "9:16", name: "Portrait", desc: "TikTok, Reels" },
  { id: "1:1", name: "Square", desc: "Instagram" },
  { id: "4:3", name: "Standard", desc: "Traditional" },
];

const mockScenes: Scene[] = [
  { id: "1", text: "Breaking news from the global climate summit as world leaders announce historic agreement.", duration: 5, imagePrompt: "World leaders at climate summit, formal setting, press conference" },
  { id: "2", text: "The agreement commits nations to reducing emissions by 50% before 2030.", duration: 4, imagePrompt: "Green energy wind turbines, solar panels, sustainable future" },
  { id: "3", text: "Environmental groups have welcomed the decision, calling it a turning point.", duration: 4, imagePrompt: "Environmental activists celebrating, diverse group, hopeful expressions" },
];

export const VideoStudio = () => {
  const [inputText, setInputText] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedStyle, setSelectedStyle] = useState(videoStyles[0]);
  const [selectedRatio, setSelectedRatio] = useState(aspectRatios[0]);
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  const handleGenerateScenes = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setScenes(mockScenes);
      setIsGenerating(false);
    }, 2000);
  };

  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

  return (
    <div className="min-h-screen">
      <Header title="Video Studio" subtitle="Transform your stories into engaging video content" />
      
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input & Scenes */}
          <div className="lg:col-span-2 space-y-4">
            {/* Text Input */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Script / Notes</h3>
                <span className="text-sm text-muted-foreground">
                  {inputText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your news article, script, or notes here. The AI will break it into scenes and generate visuals for each..."
                className="w-full h-40 p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
              />
              <div className="flex items-center justify-between mt-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Improve Script
                </Button>
                <Button 
                  onClick={handleGenerateScenes}
                  disabled={isGenerating || !inputText}
                  className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Scenes...
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4 mr-2" />
                      Generate Scenes
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Video Preview */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Video Preview</h3>
                {scenes.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {totalDuration}s total
                  </div>
                )}
              </div>
              
              {/* Preview Area */}
              <div className={cn(
                "relative rounded-xl overflow-hidden bg-black",
                selectedRatio.id === "16:9" && "aspect-video",
                selectedRatio.id === "9:16" && "aspect-[9/16] max-h-[400px] mx-auto",
                selectedRatio.id === "1:1" && "aspect-square max-h-[400px] mx-auto",
                selectedRatio.id === "4:3" && "aspect-[4/3]"
              )}>
                {scenes.length > 0 ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                      <div className="text-center p-6">
                        <Image className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                        <p className="text-foreground font-medium mb-2">Scene {currentScene + 1}</p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          {scenes[currentScene]?.text}
                        </p>
                      </div>
                    </div>
                    {/* Play button overlay */}
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-primary-foreground" />
                        ) : (
                          <Play className="w-8 h-8 text-primary-foreground ml-1" />
                        )}
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Video preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Scrubber */}
              {scenes.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setCurrentScene(Math.max(0, currentScene - 1))}
                      disabled={currentScene === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 flex gap-1">
                      {scenes.map((scene, index) => (
                        <button
                          key={scene.id}
                          onClick={() => setCurrentScene(index)}
                          className={cn(
                            "flex-1 h-2 rounded-full transition-all",
                            index === currentScene 
                              ? "bg-primary" 
                              : index < currentScene 
                                ? "bg-primary/50" 
                                : "bg-secondary"
                          )}
                          style={{ flex: scene.duration }}
                        />
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setCurrentScene(Math.min(scenes.length - 1, currentScene + 1))}
                      disabled={currentScene === scenes.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Scene {currentScene + 1} of {scenes.length}</span>
                    <span>{scenes[currentScene]?.duration}s</span>
                  </div>
                </div>
              )}
            </div>

            {/* Scene List */}
            {scenes.length > 0 && (
              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold text-foreground">Scenes</h3>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Scene
                  </Button>
                </div>
                <div className="space-y-3">
                  {scenes.map((scene, index) => (
                    <div 
                      key={scene.id}
                      onClick={() => setCurrentScene(index)}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all",
                        index === currentScene 
                          ? "bg-primary/10 border border-primary/30" 
                          : "bg-secondary/50 hover:bg-secondary border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0",
                        index === currentScene 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2">{scene.text}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {scene.duration}s
                          </span>
                          <span className="flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            AI Visual
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Settings */}
          <div className="space-y-4">
            {/* Video Style */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Video Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {videoStyles.map((style) => (
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
              <div className="space-y-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                      selectedRatio.id === ratio.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 border border-transparent hover:bg-secondary"
                    )}
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{ratio.id}</p>
                      <p className="text-xs text-muted-foreground">{ratio.desc}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{ratio.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Settings */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Audio</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                    voiceEnabled 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-secondary/50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Mic2 className={cn("w-5 h-5", voiceEnabled ? "text-primary" : "text-muted-foreground")} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">AI Voiceover</p>
                      <p className="text-xs text-muted-foreground">Sarah • American</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    voiceEnabled ? "bg-primary" : "bg-muted"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      voiceEnabled ? "left-5" : "left-1"
                    )} />
                  </div>
                </button>

                <button 
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                    musicEnabled 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-secondary/50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Video className={cn("w-5 h-5", musicEnabled ? "text-primary" : "text-muted-foreground")} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Background Music</p>
                      <p className="text-xs text-muted-foreground">News Theme</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    musicEnabled ? "bg-primary" : "bg-muted"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      musicEnabled ? "left-5" : "left-1"
                    )} />
                  </div>
                </button>
              </div>
            </div>

            {/* Export */}
            <Button 
              className="w-full bg-gradient-to-r from-primary to-amber-600 text-primary-foreground h-12"
              disabled={scenes.length === 0}
            >
              <Video className="w-5 h-5 mr-2" />
              Generate Video
            </Button>
            
            <Button variant="outline" className="w-full" disabled={scenes.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export Video
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
