import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { User, Bell, Shield, Palette, Globe, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface SettingsProps {
  onNavigate?: (path: string) => void;
}

export const Settings = ({ onNavigate }: SettingsProps) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Settings" 
        subtitle="Manage your account and preferences" 
        onNavigate={onNavigate} 
      />
      
      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-foreground">{user?.email || "Not signed in"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <p className="text-foreground">{user?.user_metadata?.full_name || "Not set"}</p>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Language & Region</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Language</p>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
                <Button variant="outline" size="sm">English</Button>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">Change your password</p>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

