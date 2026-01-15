import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { VoiceStudio } from "@/pages/VoiceStudio";
import { ImageStudio } from "@/pages/ImageStudio";
import { ContentEditor } from "@/pages/ContentEditor";
import { MultiPlatform } from "@/pages/MultiPlatform";
import { VideoStudio } from "@/pages/VideoStudio";
import { AutoLayout } from "@/pages/AutoLayout";
import { ImageEnhancer } from "@/pages/ImageEnhancer";

const Index = () => {
  const [currentPath, setCurrentPath] = useState("/");

  const renderPage = () => {
    switch (currentPath) {
      case "/":
        return <Dashboard onNavigate={setCurrentPath} />;
      case "/voice":
        return <VoiceStudio />;
      case "/image":
        return <ImageStudio />;
      case "/video":
        return <VideoStudio />;
      case "/editor":
        return <ContentEditor />;
      case "/platforms":
        return <MultiPlatform />;
      case "/layout":
        return <AutoLayout />;
      case "/enhance":
        return <ImageEnhancer />;
      default:
        return <Dashboard onNavigate={setCurrentPath} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />
      <main className="flex-1 ml-64">
        {renderPage()}
      </main>
    </div>
  );
};

export default Index;
