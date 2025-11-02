import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-9xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          {t('notFound.title', 'Seite nicht gefunden')}
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          {t('notFound.description', 'Die Seite, die du suchst, existiert nicht oder wurde verschoben.')}
        </p>
        <Button 
          asChild 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          <Link to="/" className="inline-flex items-center gap-2">
            <Home className="w-5 h-5" />
            {t('notFound.backHome', 'Zur Startseite')}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
