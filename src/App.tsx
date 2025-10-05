import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Welcome from "./pages/Welcome";
import LanguageSelection from "./pages/LanguageSelection";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ConditionSelection from "./pages/ConditionSelection";
import Dashboard from "./pages/Dashboard";
import LearnBraille from "./pages/LearnBraille";
import BrailleScanner from "./pages/BrailleScanner";
import LearnSignLanguage from "./pages/LearnSignLanguage";
import SignTranslator from "./pages/SignTranslator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-2xl text-foreground">Loading...</p>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/language" element={<LanguageSelection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/conditions" element={<ProtectedRoute><ConditionSelection /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/learn-braille" element={<ProtectedRoute><LearnBraille /></ProtectedRoute>} />
              <Route path="/braille-scanner" element={<ProtectedRoute><BrailleScanner /></ProtectedRoute>} />
              <Route path="/learn-sign" element={<ProtectedRoute><LearnSignLanguage /></ProtectedRoute>} />
              <Route path="/sign-translator" element={<ProtectedRoute><SignTranslator /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
