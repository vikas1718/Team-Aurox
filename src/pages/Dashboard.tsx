import { 
  FileText, 
  TrendingUp, 
  Users, 
  Zap,
  Mic2,
  Image,
  Video,
  FileEdit,
  Share2,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ToolCard } from "@/components/dashboard/ToolCard";
import { RecentContent } from "@/components/dashboard/RecentContent";
import { PublicationTimeline } from "@/components/dashboard/PublicationTimeline";
import { PlatformStatus } from "@/components/dashboard/PlatformStatus";
import { QuickActions } from "@/components/dashboard/QuickActions";

interface DashboardProps {
  onNavigate: (path: string) => void;
}

const tools = [
  {
    icon: Mic2,
    title: "Notes to Voice",
    description: "Transform written notes into natural AI-generated voice narration for radio and podcasts.",
    path: "/voice"
  },
  {
    icon: Image,
    title: "Image Creation",
    description: "Generate stunning visuals from text prompts for articles, social media, and print.",
    path: "/image"
  },
  {
    icon: Video,
    title: "Notes to Video",
    description: "Convert your stories into engaging video content with AI-powered visuals and narration.",
    path: "/video"
  },
  {
    icon: FileEdit,
    title: "Content Editor",
    description: "Intelligent summarization and editing tools to adapt content for different word counts.",
    path: "/editor"
  },
  {
    icon: Share2,
    title: "Multi-Platform Publishing",
    description: "One source, multiple outputs. Publish to Print, Web, Radio, Podcast, App, and Social Media.",
    path: "/platforms"
  },
  {
    icon: Calendar,
    title: "Publication Timeline",
    description: "Schedule and manage content publication across all platforms with visual timeline.",
    path: "/timeline"
  },
  {
    icon: Layers,
    title: "Auto Layout",
    description: "AI-powered automatic layout generation for print and digital publications.",
    path: "/layout"
  },
  {
    icon: Sparkles,
    title: "Image Enhancer",
    description: "Enhance photos with AI: color correction, noise reduction, and smart improvements.",
    path: "/enhance"
  },
];

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Welcome back! Here's your newsroom overview." onNavigate={onNavigate} />
      
      <main className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            icon={FileText}
            label="Published Today"
            value="47"
            change="+12%"
            changeType="positive"
            className="opacity-0 animate-slide-up stagger-1"
          />
          <StatsCard 
            icon={TrendingUp}
            label="Total Views"
            value="128K"
            change="+23%"
            changeType="positive"
            className="opacity-0 animate-slide-up stagger-2"
          />
          <StatsCard 
            icon={Users}
            label="Active Readers"
            value="8.2K"
            change="-5%"
            changeType="negative"
            className="opacity-0 animate-slide-up stagger-3"
          />
          <StatsCard 
            icon={Zap}
            label="AI Tasks Today"
            value="156"
            change="Normal"
            changeType="neutral"
            className="opacity-0 animate-slide-up stagger-4"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Content - 2 columns */}
          <div className="lg:col-span-2">
            <RecentContent />
          </div>

          {/* Quick Actions - 1 column */}
          <div>
            <QuickActions onNavigate={onNavigate} />
          </div>
        </div>

        {/* Timeline */}
        <PublicationTimeline />

        {/* Platform Status */}
        <PlatformStatus />

        {/* AI Tools Grid */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">AI Production Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, index) => (
              <ToolCard
                key={tool.title}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                onClick={() => onNavigate(tool.path)}
                className={`opacity-0 animate-slide-up stagger-${Math.min(index + 1, 6)}`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
