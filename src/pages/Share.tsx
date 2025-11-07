import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

/**
 * Share Target Handler Seite
 * Empfängt geteilte Inhalte von anderen Apps
 */
export default function Share() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sharedData, setSharedData] = useState<{
    title?: string;
    text?: string;
    url?: string;
  } | null>(null);

  useEffect(() => {
    // Prüfe ob wir von einer Share-Aktion kommen
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get("title");
    const text = urlParams.get("text");
    const url = urlParams.get("url");

    if (title || text || url) {
      setSharedData({ title: title || undefined, text: text || undefined, url: url || undefined });
    }

    // Handle POST requests (wenn als Share Target verwendet)
    if (window.location.pathname === "/share") {
      // In einer echten Implementierung würde man hier die POST-Daten verarbeiten
      // Für jetzt zeigen wir nur eine Bestätigung
    }
  }, []);

  // Redirect zu Login wenn nicht authentifiziert
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("share.title", { defaultValue: "Geteilter Inhalt" })}</CardTitle>
          <CardDescription>
            {t("share.description", {
              defaultValue: "Inhalt wurde erfolgreich empfangen",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sharedData ? (
            <div className="space-y-4">
              {sharedData.title && (
                <div>
                  <h3 className="font-semibold mb-2">{sharedData.title}</h3>
                </div>
              )}
              {sharedData.text && (
                <div>
                  <p className="text-muted-foreground">{sharedData.text}</p>
                </div>
              )}
              {sharedData.url && (
                <div>
                  <a
                    href={sharedData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {sharedData.url}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              {t("share.noData", { defaultValue: "Keine geteilten Daten gefunden" })}
            </p>
          )}
          <div className="mt-6">
            <Button onClick={() => navigate("/dashboard")}>
              {t("share.backToDashboard", { defaultValue: "Zum Dashboard" })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

