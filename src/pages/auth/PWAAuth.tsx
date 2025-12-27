import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { PublicHeader } from "@/components/common/PublicHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PWAAuth() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <PublicHeader variant="minimal" sticky={true} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 py-6 overflow-auto">
        {/* Willkommensbereich */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {activeTab === "login"
              ? t("authPages.welcomeBack")
              : t("pwaAuth.welcomeTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeTab === "login"
              ? t("authPages.continueJourney")
              : t("pwaAuth.welcomeSubtitle")}
          </p>
        </div>

        {/* Tabs für Login/Register */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "login" | "register")}
          className="w-full max-w-md mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-sm">
              {t("auth.login")}
            </TabsTrigger>
            <TabsTrigger value="register" className="text-sm">
              {t("auth.register")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <LoginForm redirectTo="/dashboard" defaultRememberMe />
          </TabsContent>

          <TabsContent value="register" className="mt-0">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>

      <LegalFooter />
    </div>
  );
}
