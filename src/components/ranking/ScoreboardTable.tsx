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
  rank?: number | null;
  displayName: string;
  avatarUrl: string | null;
  totalPoints: number;
  totalAmount?: number;
  unit?: string;
  isCurrentUser: boolean;
  isMuted?: boolean;
}

interface ScoreboardTableProps {
  activity: string;
  period: string;
  dateRange?: DateRange;
  scope: string;
}

export function ScoreboardTable({
  activity,
  period,
  dateRange,
  scope,
}: ScoreboardTableProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityMeta, setActivityMeta] = useState<{
    measurementType?: "reps" | "time" | "distance" | null;
    supportsTime?: boolean | null;
    supportsDistance?: boolean | null;
  } | null>(null);
  const { user, getDisplayName } = useAuth();
  const { t } = useTranslation();
  const needsCustomRange =
    period === "custom" && (!dateRange?.from || !dateRange?.to);

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

      const params = new URLSearchParams({ period, scope });
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
      let nextLeaderboard = Array.isArray(data.leaderboard)
        ? data.leaderboard
        : [];
      if (user) {
        const alreadyListed = nextLeaderboard.some(
          (entry) => entry.id === user.id
        );
        if (!alreadyListed) {
          const fallbackEntry = {
            id: user.id,
            displayName: getDisplayName ? getDisplayName() : user.nickname || user.firstName || "Du",
            avatarUrl: user.avatar || null,
            totalPoints: 0,
            totalAmount: 0,
            rank: null,
            isCurrentUser: true,
            isMuted: scope === "global" && user.showInGlobalRankings === false,
          };
          const insertIndex = nextLeaderboard.findIndex(
            (entry) => (entry.totalPoints ?? 0) < fallbackEntry.totalPoints
          );
          if (insertIndex === -1) {
            nextLeaderboard = [...nextLeaderboard, fallbackEntry];
          } else {
            nextLeaderboard = [
              ...nextLeaderboard.slice(0, insertIndex),
              fallbackEntry,
              ...nextLeaderboard.slice(insertIndex),
            ];
          }
        }
      }
      setLeaderboard(nextLeaderboard);
      if (data.activityMeta) {
        setActivityMeta(data.activityMeta);
      } else {
        setActivityMeta(null);
      }
    } catch (error) {
      console.error("Scoreboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activity, dateRange?.from, dateRange?.to, period, scope, t, user, getDisplayName]);

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

  const getRankColor = (rank?: number | null, muted?: boolean) => {
    if (muted || !rank) return "text-muted-foreground";
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-orange-600";
    return "text-muted-foreground";
  };

  const distanceUnit = user?.preferences?.units?.distance === "miles" ? "miles" : "km";
  const distanceLabel =
    distanceUnit === "miles"
      ? t("training.form.units.milesShort", "mi")
      : t("training.form.units.kilometersShort", "km");

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
      {leaderboard.map((player) => {
        const displayRank = player.isMuted ? null : player.rank;
        return (
          <div
            key={player.id}
            className={`
              flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md
              ${
                player.isCurrentUser
                  ? "bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40"
                  : "bg-card border-border hover:bg-accent/50"
              }
              ${player.isMuted ? "opacity-70" : ""}
            `}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg font-bold w-8 text-center ${getRankColor(displayRank, player.isMuted)}`}
                >
                  {displayRank ?? "—"}
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
                {player.isMuted && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {t("scoreboard.notRanked", "Nicht in Wertung")}
                    </Badge>
                  </div>
                )}
                {activity !== "all" && player.totalAmount !== undefined && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {t("scoreboard.units.amount", "Menge")}:{" "}
                      {activityMeta?.measurementType === "distance"
                        ? distanceUnit === "miles"
                          ? (player.totalAmount / 1.60934).toFixed(1)
                          : player.totalAmount.toFixed(1)
                        : activityMeta?.measurementType === "time"
                          ? Math.round((player.totalAmount || 0) / 60)
                          : Math.round(player.totalAmount)}
                      {" "}
                      {activityMeta?.measurementType === "distance"
                        ? distanceLabel
                        : activityMeta?.measurementType === "time"
                          ? t("training.form.units.minutesShort", "Min")
                          : t("training.form.units.repetitionsShort", "Wdh.")}
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
        );
      })}
    </div>
  );
}
