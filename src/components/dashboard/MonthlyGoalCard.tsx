import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
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
        className={cn("overflow-hidden transition-shadow", className)}
        role="region"
        aria-labelledby={titleId}
        tabIndex={0}
      >
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex flex-nowrap items-center justify-between gap-5 min-w-0">
            <Skeleton className="h-7 w-32 rounded-md" />
            <div className="flex flex-wrap items-center justify-between gap-0 w-full">
              <Skeleton className="h-9 w-9 rounded-md shrink-0" />
              <Skeleton className="h-5 w-28 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md shrink-0" />
            </div>
            <Skeleton className="h-10 w-10 rounded-md shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-3 space-y-4 min-h-0">
          <div className="space-y-2">
            <div className="flex flex-wrap justify-between items-baseline gap-x-3 gap-y-1">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-md/50",
        className
      )}
      role="region"
      aria-labelledby={titleId}
      tabIndex={0}
    >
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex flex-nowrap items-center justify-between gap-5 min-w-0">
          <CardTitle
            className="flex flex-wrap w-fit min-w-[140px] h-fit text-[23px] font-semibold tracking-tight"
            id={titleId}
          >
            {t("dashboard.monthlyGoal", "Monthly goal")}
          </CardTitle>
          <div className="flex flex-wrap items-center justify-between gap-0 w-full">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-fit h-fit shrink-0 p-2.5"
              disabled={monthOffset >= maxOffset}
              onClick={() =>
                setMonthOffset((prev) => Math.min(maxOffset, prev + 1))
              }
              aria-label={t("common.previous", "Zurück")}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </Button>
            <span
              className="text-sm sm:text-base font-semibold tabular-nums text-foreground text-center min-w-0 break-words px-1"
              aria-live="polite"
            >
              {labelDate}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-fit h-fit shrink-0 p-2.5"
              disabled={monthOffset === 0}
              onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
              aria-label={t("common.next", "Weiter")}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 p-3 text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  title={t("dashboard.monthlyGoalAutoAdjust")}
                >
                  <Info className="h-4 w-4" aria-hidden />
                  <span className="sr-only">
                    {t("dashboard.monthlyGoalAutoAdjust")}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                align="start"
                className="max-w-xs text-sm"
              >
                {t("dashboard.monthlyGoalAutoAdjust")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-4 min-h-0">
        {/* Progress block */}
        <div className="space-y-2">
          <div className="flex flex-wrap justify-between items-baseline gap-x-3 gap-y-1 text-sm">
            <span className="text-muted-foreground">
              {t("dashboard.points", "Punkte")}{" "}
              <span className="text-foreground/80">
                ({t("dashboard.goal", "Ziel")}: {target.toLocaleString()})
              </span>
            </span>
            <span className="font-semibold tabular-nums text-foreground shrink-0">
              {(stats.periodPoints ?? 0).toLocaleString()} /{" "}
              {target.toLocaleString()}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2.5 rounded-full"
            aria-label={`${t("dashboard.points", "Punkte")}: ${(stats.periodPoints ?? 0).toLocaleString()} von ${target.toLocaleString()} ${t("dashboard.goal", "Ziel")} erreicht`}
            role="progressbar"
            aria-valuenow={stats.periodPoints ?? 0}
            aria-valuemin={0}
            aria-valuemax={target}
          />
          <p className="text-xs text-muted-foreground">
            +{(stats.periodPoints ?? 0).toLocaleString()}{" "}
            {t("dashboard.thisMonth", "diesen Monat")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
