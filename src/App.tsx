
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import FacebookAccountSetup from "./pages/FacebookAccountSetup";
import CalendarBooking from "./pages/CalendarBooking";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import NurturingSettings from "./pages/NurturingSettings";
import LeadNurturing from "./pages/LeadNurturing";
import { useEffect } from "react";
import Lenis from "lenis";

const queryClient = new QueryClient();

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <SmoothScroll>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/book-meeting" element={<CalendarBooking />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/facebook-setup" element={
                  <ProtectedRoute>
                    <FacebookAccountSetup />
                  </ProtectedRoute>
                } />
                <Route path="/nurturing-settings" element={
                  <ProtectedRoute>
                    <NurturingSettings />
                  </ProtectedRoute>
                } />
                <Route path="/lead-nurturing" element={
                  <ProtectedRoute>
                    <LeadNurturing />
                  </ProtectedRoute>
                } />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </SmoothScroll>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
