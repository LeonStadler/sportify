import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { API_URL } from "@/lib/api";
import { Calendar } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/skeleton";

interface MonthlyGoalCardProps {
  className?: string;
}

interface MonthlyStats {
  periodPoints: number;
  target: number;
  averagePoints?: number;
}

export function MonthlyGoalCard({ className }: MonthlyGoalCardProps) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const [stats, setStats] = useState<MonthlyStats>({
    periodPoints: 0,
    target: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const maxOffset = 11;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadMonthlyStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/stats/monthly-goal?offset=${monthOffset}`,
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        );

        if (response.ok) {
          const data = await response.json();
          setStats({
            periodPoints: data.currentPoints || 0,
            target: data.target || 0,
            averagePoints: data.averagePoints || 0,
          });
          setMonthKey(data.month || null);
        }
      } catch (error) {
        console.error("Error loading monthly stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthlyStats();
  }, [user, monthOffset]);

  const target = stats.target > 0 ? stats.target : 6000;
  const progressPercentage = Math.min(
    target > 0 ? ((stats.periodPoints ?? 0) / target) * 100 : 0,
    100
  );
  const labelDate =
    monthKey && !Number.isNaN(Date.parse(`${monthKey}-01`))
      ? new Date(`${monthKey}-01`).toLocaleDateString(
          i18n.language === "en" ? "en-US" : "de-DE",
          { month: "long", year: "numeric" }
        )
      : t("dashboard.thisMonth", "diesen Monat");

  if (isLoading) {
    return (
      <Card
        className={className}
        role="region"
        aria-labelledby={titleId}
        tabIndex={0}
      >
        <CardHeader className="pb-4">
          <CardTitle
            className="text-lg md:text-xl flex items-center gap-2"
            id={titleId}
          >
            <Calendar className="h-5 w-5" />
            {t("dashboard.monthlyGoal", "Monthly goal")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={className}
      role="region"
      aria-labelledby={titleId}
      tabIndex={0}
    >
        <CardHeader className="pb-4">
          <CardTitle
            className="text-lg md:text-xl flex items-center gap-2"
            id={titleId}
          >
            <Calendar className="h-5 w-5" />
            {t("dashboard.monthlyGoal", "Monthly goal")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={monthOffset >= maxOffset}
              onClick={() => setMonthOffset((prev) => Math.min(maxOffset, prev + 1))}
            >
              {t("common.previous", "Zurück")}
            </Button>
            <span>{labelDate}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={monthOffset === 0}
              onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
            >
              {t("common.next", "Weiter")}
            </Button>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>
              {t("dashboard.points", "Punkte")} ({t("dashboard.goal", "Ziel")}:{" "}
              {target.toLocaleString()})
            </span>
            <span className="font-medium">
              {(stats.periodPoints ?? 0).toLocaleString()}/
              {target.toLocaleString()}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2"
            aria-label={`${t("dashboard.points", "Punkte")}: ${(stats.periodPoints ?? 0).toLocaleString()} von ${target.toLocaleString()} ${t("dashboard.goal", "Ziel")} erreicht`}
            role="progressbar"
            aria-valuenow={stats.periodPoints ?? 0}
            aria-valuemin={0}
            aria-valuemax={target}
          />
          <p className="text-xs text-muted-foreground mt-2">
            +{(stats.periodPoints ?? 0).toLocaleString()}{" "}
            {t("dashboard.thisMonth", "diesen Monat")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              "dashboard.monthlyGoalAutoAdjust",
              "Das Monatsziel passt sich automatisch an deine letzten Monate an."
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
