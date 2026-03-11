import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Contexts ─────────────────────────────────────────────────
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>

            {/* ── Auth ── */}
            <Route path="/login" element={<Login />} />

            {/* ── Protected Routes ── */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />

            {/* ── Reporter Dashboard ── */}
            <Route path="/reporter-dashboard" element={<ProtectedRoute><ReporterDashboard /></ProtectedRoute>} />

            {/* ── Chief Reporter Dashboard ── */}
            <Route path="/chief-dashboard" element={<ProtectedRoute><ChiefDashboard /></ProtectedRoute>} />

            {/* ── Sub Editor → redirects to main app ── */}
            <Route path="/editor-dashboard" element={<Navigate to="/" replace />} />

            {/* ── Catch-all ── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
