import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { API_URL } from "@/lib/api";
import { parseAvatarConfig } from "@/lib/avatar";
import { toDateParam } from "@/utils/dateRanges";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import NiceAvatar from "react-nice-avatar";

interface LeaderboardUser {
  id: string;
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  totalPoints: number;
  totalPullups?: number;
  totalPushups?: number;
  totalRunning?: number;
  totalCycling?: number;
  totalAmount?: number;
  unit?: string;
  isCurrentUser: boolean;
}

interface ScoreboardTableProps {
  activity: string;
  period: string;
  dateRange?: DateRange;
}

export function ScoreboardTable({
  activity,
  period,
  dateRange,
}: ScoreboardTableProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();
  const needsCustomRange =
    period === "custom" && (!dateRange?.from || !dateRange?.to);

  const getUnitForActivity = (activityType: string) => {
    switch (activityType) {
      case "pullups":
      case "pushups":
      case "situps":
        return t("scoreboard.units.repetitions");
      case "running":
      case "cycling":
        return t("scoreboard.units.kilometers");
      default:
        return t("scoreboard.units.points");
    }
  };

  const fetchLeaderboard = useCallback(async () => {
    if (period === "custom" && (!dateRange?.from || !dateRange?.to)) {
      setLeaderboard([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API_URL}/scoreboard/`;
      if (activity === "all") {
        url += `overall`;
      } else {
        url += `activity/${activity}`;
      }

      const params = new URLSearchParams({ period });
      if (dateRange?.from && dateRange?.to) {
        params.set("start", toDateParam(dateRange.from));
        params.set("end", toDateParam(dateRange.to));
      }
      url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t("scoreboard.errorLoading"));
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error("Scoreboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activity, dateRange?.from, dateRange?.to, period, t]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getAvatarFallback = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-orange-600";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex items-center p-4 h-24 bg-muted rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (needsCustomRange) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("filters.rangePlaceholder")}</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("scoreboard.noData")}</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          {t("scoreboard.participateToAppear")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaderboard.map((player) => (
        <div
          key={player.id}
          className={`
            flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md
            ${
              player.isCurrentUser
                ? "bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40"
                : "bg-card border-border hover:bg-accent/50"
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`text-lg font-bold w-8 text-center ${getRankColor(player.rank)}`}
              >
                {player.rank}
              </span>
              <Avatar>
                {player.avatarUrl && parseAvatarConfig(player.avatarUrl) ? (
                  <NiceAvatar
                    style={{ width: "40px", height: "40px" }}
                    {...parseAvatarConfig(player.avatarUrl)!}
                  />
                ) : (
                  <AvatarFallback
                    className={`${player.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {getAvatarFallback(player.displayName)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {player.displayName}
              </p>
              {activity === "all" && (
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {t("scoreboard.stats.pullups")}: {player.totalPullups || 0}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {t("scoreboard.stats.pushups")}: {player.totalPushups || 0}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {t("scoreboard.stats.running")}: {player.totalRunning || 0}{" "}
                    {t("scoreboard.units.kilometers")}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-foreground">
              {player.totalPoints ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("scoreboard.units.points")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
