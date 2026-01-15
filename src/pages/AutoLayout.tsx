import { useState } from "react";
import { 
  Layers, 
  Wand2, 
  Download, 
  RefreshCw,
  Grid3X3,
  Columns,
  LayoutGrid,
  Newspaper,
  Monitor,
  Smartphone,
  FileText,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  ChevronDown
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutTemplate {
  id: string;
  name: string;
  columns: number;
  preview: string;
  type: "print" | "digital";
}

const layoutTemplates: LayoutTemplate[] = [
  { id: "front-page", name: "Front Page", columns: 5, preview: "Classic newspaper front", type: "print" },
  { id: "feature", name: "Feature Spread", columns: 3, preview: "Magazine style layout", type: "print" },
  { id: "opinion", name: "Opinion Section", columns: 2, preview: "Editorial columns", type: "print" },
  { id: "web-article", name: "Web Article", columns: 1, preview: "Responsive web layout", type: "digital" },
  { id: "web-grid", name: "News Grid", columns: 3, preview: "Card-based homepage", type: "digital" },
  { id: "mobile-feed", name: "Mobile Feed", columns: 1, preview: "Scrollable mobile view", type: "digital" },
];

interface ContentBlock {
  id: string;
  type: "headline" | "subhead" | "body" | "image" | "caption" | "pullquote";
  content: string;
  span?: number;
}

const mockBlocks: ContentBlock[] = [
  { id: "1", type: "headline", content: "Global Climate Summit Reaches Historic Agreement", span: 5 },
  { id: "2", type: "image", content: "main-image", span: 3 },
  { id: "3", type: "subhead", content: "World leaders commit to 50% emission reduction by 2030", span: 2 },
  { id: "4", type: "body", content: "In a landmark decision that environmental groups are calling a turning point...", span: 2 },
  { id: "5", type: "pullquote", content: "\"This is the most significant climate action in a generation.\"", span: 1 },
  { id: "6", type: "body", content: "The agreement, reached after intense negotiations, sets binding targets...", span: 2 },
  { id: "7", type: "image", content: "secondary-image", span: 2 },
  { id: "8", type: "caption", content: "Leaders signing the historic agreement in Geneva", span: 2 },
];

const pageSizes = [
  { id: "broadsheet", name: "Broadsheet", size: "375 × 600mm" },
  { id: "tabloid", name: "Tabloid", size: "280 × 430mm" },
  { id: "a4", name: "A4", size: "210 × 297mm" },
  { id: "web", name: "Web (1200px)", size: "Responsive" },
];

export const AutoLayout = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>(null);
  const [selectedPageSize, setSelectedPageSize] = useState(pageSizes[0]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<"print" | "digital">("print");
  const [inputText, setInputText] = useState("");

  const handleGenerateLayout = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setContentBlocks(mockBlocks);
      setIsGenerating(false);
    }, 2000);
  };

  const filteredTemplates = layoutTemplates.filter(t => t.type === activeTab);

  return (
    <div className="min-h-screen">
      <Header title="Auto Layout" subtitle="AI-powered layout generation for print and digital" />
      
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Content Input */}
          <div className="space-y-4">
            {/* Content Source */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Content</h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your article content here..."
                className="w-full h-32 p-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <div className="mt-3 p-3 rounded-xl bg-secondary/50 border border-dashed border-border text-center">
                <p className="text-xs text-muted-foreground">Drop images here</p>
              </div>
            </div>

            {/* Type Toggle */}
            <div className="card-elevated p-2">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("print")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
                    activeTab === "print" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Newspaper className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => setActiveTab("digital")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
                    activeTab === "digital" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Monitor className="w-4 h-4" />
                  Digital
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Templates</h3>
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                      selectedTemplate?.id === template.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 border border-transparent hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      selectedTemplate?.id === template.id ? "bg-primary/20" : "bg-muted"
                    )}>
                      {template.columns === 1 ? (
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      ) : template.columns <= 2 ? (
                        <Columns className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Grid3X3 className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.preview}</p>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Size (Print only) */}
            {activeTab === "print" && (
              <div className="card-elevated p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Page Size</h3>
                <div className="space-y-2">
                  {pageSizes.filter(p => p.id !== "web").map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedPageSize(size)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                        selectedPageSize.id === size.id
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-secondary/50 border border-transparent hover:bg-secondary"
                      )}
                    >
                      <span className="text-sm font-medium text-foreground">{size.name}</span>
                      <span className="text-xs text-muted-foreground">{size.size}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={handleGenerateLayout}
              disabled={isGenerating || !selectedTemplate || !inputText}
              className="w-full bg-gradient-to-r from-primary to-amber-600 text-primary-foreground h-12"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Layout
                </>
              )}
            </Button>
          </div>

          {/* Center - Layout Preview */}
          <div className="lg:col-span-2">
            <div className="card-elevated p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Layout Preview</h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setZoom(Math.min(150, zoom + 10))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setZoom(100)}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="relative bg-muted/30 rounded-xl overflow-hidden" style={{ minHeight: "600px" }}>
                {contentBlocks.length > 0 ? (
                  <div 
                    className="p-8 origin-top-left transition-transform"
                    style={{ transform: `scale(${zoom / 100})` }}
                  >
                    {/* Mock newspaper layout */}
                    <div className="bg-white rounded-lg shadow-2xl p-6 text-black" style={{ width: "500px" }}>
                      {/* Masthead */}
                      <div className="text-center border-b-2 border-black pb-4 mb-4">
                        <h1 className="font-display text-3xl font-bold tracking-tight">THE DAILY FORGE</h1>
                        <p className="text-xs text-gray-500 mt-1">January 15, 2026 • Digital Edition</p>
                      </div>
                      
                      {/* Grid layout */}
                      <div className="grid grid-cols-5 gap-3">
                        {contentBlocks.map((block) => (
                          <div 
                            key={block.id}
                            className={cn(
                              "p-2 rounded transition-all hover:ring-2 hover:ring-primary/50",
                              block.type === "headline" && "col-span-5",
                              block.type === "image" && block.span === 3 && "col-span-3 row-span-2",
                              block.type === "image" && block.span === 2 && "col-span-2",
                              block.type === "subhead" && "col-span-2",
                              block.type === "body" && "col-span-2",
                              block.type === "pullquote" && "col-span-1",
                              block.type === "caption" && "col-span-2"
                            )}
                          >
                            {block.type === "headline" && (
                              <h2 className="font-display text-2xl font-bold leading-tight">{block.content}</h2>
                            )}
                            {block.type === "subhead" && (
                              <p className="text-sm font-medium text-gray-700">{block.content}</p>
                            )}
                            {block.type === "image" && (
                              <div className="w-full h-full min-h-[100px] bg-gray-200 rounded flex items-center justify-center">
                                <Layers className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            {block.type === "body" && (
                              <p className="text-xs leading-relaxed text-gray-800">{block.content}</p>
                            )}
                            {block.type === "pullquote" && (
                              <blockquote className="text-sm italic border-l-2 border-black pl-2">
                                {block.content}
                              </blockquote>
                            )}
                            {block.type === "caption" && (
                              <p className="text-xs text-gray-500 italic">{block.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <LayoutGrid className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a template and generate layout</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Layout Overshoot / Controls */}
          <div className="space-y-4">
            {/* Layout Overshoot */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Layout Fit</h3>
                {contentBlocks.length > 0 && (
                  <span className="status-badge status-live">OK</span>
                )}
              </div>
              
              {contentBlocks.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Column Usage</span>
                      <span className="text-sm font-medium text-foreground">92%</span>
                    </div>
                    <div className="timeline-bar">
                      <div className="timeline-progress" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Text Overflow</span>
                      <span className="text-sm font-medium text-green-400">None</span>
                    </div>
                    <div className="timeline-bar">
                      <div className="h-full rounded-full bg-green-500" style={{ width: "0%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Image Fit</span>
                      <span className="text-sm font-medium text-foreground">100%</span>
                    </div>
                    <div className="timeline-bar">
                      <div className="timeline-progress" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Generate a layout to see fit analysis
                </p>
              )}
            </div>

            {/* AI Suggestions */}
            {contentBlocks.length > 0 && (
              <div className="card-elevated p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">AI Suggestions</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm text-foreground mb-1">Optimize headline</p>
                    <p className="text-xs text-muted-foreground">Shorten by 2 words for better visual balance</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <p className="text-sm text-foreground mb-1">Add pull quote</p>
                    <p className="text-xs text-muted-foreground">Consider adding a quote in column 4</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <p className="text-sm text-foreground mb-1">Image crop</p>
                    <p className="text-xs text-muted-foreground">Auto-crop available for better focus</p>
                  </div>
                </div>
              </div>
            )}

            {/* Export Options */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Export</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled={contentBlocks.length === 0}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled={contentBlocks.length === 0}>
                  <Layers className="w-4 h-4 mr-2" />
                  Export to InDesign
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled={contentBlocks.length === 0}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Publish to Web
                </Button>
              </div>
            </div>

            {/* Device Preview */}
            {activeTab === "digital" && (
              <div className="card-elevated p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Preview As</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Monitor className="w-4 h-4 mr-1" />
                    Desktop
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Smartphone className="w-4 h-4 mr-1" />
                    Mobile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
