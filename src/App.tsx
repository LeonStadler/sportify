import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Admin } from "@/pages/Admin";
import EmailVerification from "@/pages/auth/EmailVerification";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import TwoFactor from "@/pages/auth/TwoFactor";
import Contact from "@/pages/Contact";
import { Dashboard } from "@/pages/Dashboard";
import { Friends } from "@/pages/Friends";
import Landing from "@/pages/Landing";
import { Profile } from "@/pages/Profile";
import { Scoreboard } from "@/pages/Scoreboard";
import { Stats } from "@/pages/Stats";
import { Training } from "@/pages/Training";
import { Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound";

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Zeige einen Loader während der Auth-Initialisierung
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Sportify...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <TooltipProvider>
        <Routes>
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/two-factor" element={<TwoFactor />} />
          <Route path="/auth/email-verification" element={<EmailVerification />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1 p-3 md:p-6 bg-gray-50 pb-20 md:pb-6">
              <div className="mb-4">
                <SidebarTrigger className="lg:hidden" />
              </div>
              <Routes>
                <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/scoreboard" element={<Scoreboard />} />
                <Route path="/training" element={<Training />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/profile" element={<Profile />} />
              <Route path="/friends" element={<Friends />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/users" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <MobileBottomNav />
          </div>
        </SidebarProvider>
    </TooltipProvider>
);
};

export default App;
