import { 
  LayoutDashboard, 
  Mic2, 
  Image, 
  Video, 
  FileText, 
  Share2, 
  Calendar, 
  Layers, 
  Sparkles, 
  Scale,
  Languages,
  Lightbulb,
  Settings,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
}

const stage1Items: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Mic2, label: "Notes to Voice", href: "/voice" },
  { icon: Image, label: "Image Creation", href: "/image" },
  { icon: Video, label: "Notes to Video", href: "/video" },
  { icon: FileText, label: "Content Editor", href: "/editor" },
  { icon: Share2, label: "Multi-Platform", href: "/platforms" },
  { icon: Calendar, label: "Publication Timeline", href: "/timeline" },
  { icon: Layers, label: "Auto Layout", href: "/layout" },
  { icon: Sparkles, label: "Image Enhancer", href: "/enhance" },
  { icon: Scale, label: "Upscaling", href: "/upscale" },
];

const stage2Items: NavItem[] = [
  { icon: Lightbulb, label: "Recommendations", href: "/recommendations", badge: "Soon" },
  { icon: Languages, label: "Translation", href: "/translation", badge: "Soon" },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar = ({ currentPath, onNavigate }: SidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center glow-primary">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">NewsForge</h1>
            <p className="text-xs text-muted-foreground">AI News Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Production Tools
          </p>
          <div className="space-y-1">
            {stage1Items.map((item) => (
              <button
                key={item.href}
                onClick={() => onNavigate(item.href)}
                className={cn(
                  "nav-item w-full text-left",
                  currentPath === item.href && "active"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Advanced Features
          </p>
          <div className="space-y-1">
            {stage2Items.map((item) => (
              <button
                key={item.href}
                onClick={() => onNavigate(item.href)}
                className={cn(
                  "nav-item w-full text-left opacity-60",
                  currentPath === item.href && "active"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <button className="nav-item flex-1 justify-center">
            <Settings className="w-4 h-4" />
          </button>
          <button className="nav-item flex-1 justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-6 w-2 h-2 rounded-full bg-primary" />
          </button>
        </div>
      </div>
    </aside>
  );
};
