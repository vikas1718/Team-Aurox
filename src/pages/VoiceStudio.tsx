import { useState } from "react";
import { 
  Mic2, 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  Settings,
  Wand2,
  RefreshCw
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const voices = [
  { id: "1", name: "Sarah", accent: "American", gender: "Female", preview: true },
  { id: "2", name: "James", accent: "British", gender: "Male", preview: true },
  { id: "3", name: "Priya", accent: "Indian", gender: "Female", preview: true },
  { id: "4", name: "Chen", accent: "Chinese", gender: "Male", preview: true },
  { id: "5", name: "Maria", accent: "Spanish", gender: "Female", preview: true },
  { id: "6", name: "Ahmed", accent: "Arabic", gender: "Male", preview: true },
];

export const VoiceStudio = () => {
  const [selectedVoice, setSelectedVoice] = useState(voices[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);
  const [inputText, setInputText] = useState("");

  return (
    <div className="min-h-screen">
      <Header title="Notes to Voice" subtitle="Transform your written content into natural speech" />
      
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Input */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Input Text</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {inputText.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Improve
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
              
              {/* Waveform Placeholder */}
              <div className="h-24 rounded-xl bg-secondary/50 border border-border flex items-center justify-center mb-4 overflow-hidden">
                <div className="flex items-end gap-1 h-16">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 rounded-full bg-primary/30 transition-all",
                        isPlaying && "animate-pulse"
                      )}
                      style={{ 
                        height: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">00:00</span>
                  <div className="flex-1 timeline-bar">
                    <div className="timeline-progress" style={{ width: "0%" }} />
                  </div>
                  <span className="text-sm text-muted-foreground">--:--</span>
                </div>

                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Volume2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
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
                      selectedVoice.id === voice.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {voice.name[0]}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-foreground">{voice.name}</p>
                      <p className="text-xs text-muted-foreground">{voice.accent} • {voice.gender}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                      <Play className="w-4 h-4" />
                    </Button>
                  </button>
                ))}
              </div>
            </div>

            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Voice Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">Speed</label>
                    <span className="text-sm font-medium text-foreground">{speed[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">Pitch</label>
                    <span className="text-sm font-medium text-foreground">{pitch[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={pitch}
                    onValueChange={setPitch}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-primary to-amber-600 text-primary-foreground h-12">
              <Mic2 className="w-5 h-5 mr-2" />
              Generate Voice
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
