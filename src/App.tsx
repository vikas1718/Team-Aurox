import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Existing pages ────────────────────────────────────────────
import Index    from "./pages/Index";
import NotFound from "./pages/NotFound";

// ── Role-based pages ──────────────────────────────────────────
import { Login }             from "./pages/Login";
import { ReporterDashboard } from "./pages/Reporterdashboard";
import { ChiefDashboard }    from "./pages/ChiefDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          {/* ── Auth ── */}
          <Route path="/login" element={<Login />} />

          {/* ── Reporter Dashboard ── */}
          <Route path="/reporter-dashboard" element={<ReporterDashboard />} />

          {/* ── Chief Reporter Dashboard ── */}
          <Route path="/chief-dashboard" element={<ChiefDashboard />} />

          {/* ── Sub Editor → redirects to main app ── */}
          <Route path="/editor-dashboard" element={<Navigate to="/" replace />} />

          {/* ── Main App ── */}
          <Route path="/" element={<Index />} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;