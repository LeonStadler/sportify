import { AppSidebar } from "@/components/AppSidebar";
import { InstallPrompt } from "@/components/InstallPrompt";
import { InviteLinkHandler } from "@/components/InviteLinkHandler";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { OfflineBanner } from "@/components/OfflineBanner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { usePWA } from "@/hooks/usePWA";
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// Lazy load pages for code splitting
const Admin = lazy(() =>
  import("@/pages/Admin").then((m) => ({ default: m.Admin }))
);
const EmailVerification = lazy(() => import("@/pages/auth/EmailVerification"));
const Login = lazy(() => import("@/pages/auth/Login"));
const PWAAuth = lazy(() => import("@/pages/auth/PWAAuth"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const Contact = lazy(() => import("@/pages/Contact"));
const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const Friends = lazy(() =>
  import("@/pages/Friends").then((m) => ({ default: m.Friends }))
);
const FriendProfile = lazy(() =>
  import("@/pages/FriendProfile").then((m) => ({ default: m.FriendProfile }))
);
const FriendsActivities = lazy(() =>
  import("@/pages/FriendsActivities").then((m) => ({
    default: m.FriendsActivities,
  }))
);
const Imprint = lazy(() => import("@/pages/Imprint"));
const Invite = lazy(() =>
  import("@/pages/Invite").then((m) => ({ default: m.Invite }))
);
const Landing = lazy(() => import("@/pages/Landing"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Profile = lazy(() =>
  import("@/pages/Profile").then((m) => ({ default: m.Profile }))
);
const Scoreboard = lazy(() =>
  import("@/pages/Scoreboard").then((m) => ({ default: m.Scoreboard }))
);
const Stats = lazy(() =>
  import("@/pages/Stats").then((m) => ({ default: m.Stats }))
);
const Terms = lazy(() => import("@/pages/Terms"));
const Training = lazy(() =>
  import("@/pages/Training").then((m) => ({ default: m.Training }))
);
const Share = lazy(() => import("@/pages/Share"));
const Changelog = lazy(() =>
  import("@/pages/Changelog").then((m) => ({ default: m.Changelog }))
);
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Lade Seite...</p>
    </div>
  </div>
);

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isMobilePWA } = usePWA();

  // Offline-Synchronisation aktivieren
  useOfflineSync();

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
    // Mobile PWA: Zeige optimierten PWA-Auth-Screen
    if (isMobilePWA) {
      return (
        <TooltipProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/imprint" element={<Imprint />} />
              <Route path="/invite/:userId" element={<Invite />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route
                path="/auth/email-verification"
                element={<EmailVerification />}
              />
              {/* PWA Auth Screen für alle anderen Routen */}
              <Route path="*" element={<PWAAuth />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      );
    }

    // Standard: Normale Auth-Seiten und Landing
    return (
      <TooltipProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/imprint" element={<Imprint />} />
            <Route path="/invite/:userId" element={<Invite />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route
              path="/auth/email-verification"
              element={<EmailVerification />}
            />
            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <OfflineBanner />
        <InviteLinkHandler />
        <InstallPrompt />
        <div
          className="min-h-screen flex w-full"
          role="application"
          aria-label="Sportify App"
        >
          <AppSidebar />
          <main
            className="flex-1 p-3 md:p-6 bg-background pb-20 md:pb-6"
            role="main"
            aria-label="Hauptinhalt"
          >
            <div className="mb-4">
              <SidebarTrigger className="lg:hidden" />
            </div>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/scoreboard" element={<Scoreboard />} />
                <Route path="/training" element={<Training />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/friends" element={<Friends />} />
                <Route
                  path="/friends/activities"
                  element={<FriendsActivities />}
                />
                <Route path="/friends/:friendId" element={<FriendProfile />} />
                <Route path="/invite/:userId" element={<Invite />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/imprint" element={<Imprint />} />
                <Route path="/share" element={<Share />} />
                <Route path="/changelog" element={<Changelog />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <MobileBottomNav />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default App;
