import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { API_URL } from "@/lib/api";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "./ui/skeleton";

interface MonthlyGoalCardProps {
  className?: string;
}

interface MonthlyStats {
  totalPoints: number;
  periodPoints: number;
}

const MONTHLY_POINTS_TARGET = 6000;

export function MonthlyGoalCard({ className }: MonthlyGoalCardProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<MonthlyStats>({
    totalPoints: 0,
    periodPoints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

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

        const response = await fetch(`${API_URL}/stats?period=month`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalPoints: data.totalPoints || 0,
            periodPoints: data.periodPoints || 0,
          });
        }
      } catch (error) {
        console.error("Error loading monthly stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthlyStats();
  }, [user]);

  const progressPercentage = Math.min(
    ((stats.periodPoints ?? 0) / MONTHLY_POINTS_TARGET) * 100,
    100
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
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
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t("dashboard.monthlyGoal", "Monthly goal")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>
              {t("dashboard.points", "Punkte")} ({t("dashboard.goal", "Ziel")}:{" "}
              {MONTHLY_POINTS_TARGET.toLocaleString()})
            </span>
            <span className="font-medium">
              {(stats.periodPoints ?? 0).toLocaleString()}/
              {MONTHLY_POINTS_TARGET.toLocaleString()}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            +{(stats.periodPoints ?? 0).toLocaleString()}{" "}
            {t("dashboard.thisMonth", "diesen Monat")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
