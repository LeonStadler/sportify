import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { API_URL } from "@/lib/api";
import { parseAvatarConfig } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Calendar,
  CalendarDays,
  Globe,
  MoreVertical,
  Trophy,
  Users,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NiceAvatar from "react-nice-avatar";

interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarUrl?: string;
  totalPoints: number;
  rank: number;
  isCurrentUser: boolean;
}

interface DashboardLeaderboardCardProps {
  className?: string;
}

export function DashboardLeaderboardCard({
  className,
}: DashboardLeaderboardCardProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [scope, setScope] = useState<"friends" | "global">("friends");

  useEffect(() => {
    if (!user) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const queryParams = new URLSearchParams({
          period,
          scope,
        });

        const response = await fetch(
          `${API_URL}/scoreboard/overall?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, period, scope]);

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const currentUserEntry = leaderboard.find((e) => e.isCurrentUser);

  const selectEntries = () => {
    if (!leaderboard.length) return [];
    const byRank = (rank: number) =>
      leaderboard.find((entry) => entry.rank === rank);
    const ranks = new Set<number>();
    const lastRank = leaderboard[leaderboard.length - 1]?.rank ?? 0;

    if (!currentUserEntry) {
      leaderboard.slice(0, 4).forEach((e) => ranks.add(e.rank));
    } else {
      const r = currentUserEntry.rank;
      const add = (rank: number) => {
        if (rank > 0 && rank <= lastRank && byRank(rank)) ranks.add(rank);
      };

      if (r === 1) {
        [1, 2, 3].forEach(add);
      } else if (r === 2) {
        [1, 2, 3].forEach(add);
      } else if (r === 3) {
        [1, 2, 3, 4].forEach(add);
      } else {
        add(1); // immer Platz 1
        add(r); // eigener Platz
        add(r - 1); // darüber
        add(r + 1); // darunter
        if (ranks.size < 4) {
          add(r - 2); // falls Rand, noch einen darüber
        }
      }
    }

    const selectedRanks = Array.from(ranks).sort((a, b) => a - b).slice(0, 4);
    return selectedRanks
      .map((rank) => byRank(rank))
      .filter((e): e is LeaderboardEntry => Boolean(e));
  };

  const entriesToShow = selectEntries();

  const renderEntry = (entry: LeaderboardEntry) => (
    <div
      key={entry.id}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors",
        entry.isCurrentUser
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
          entry.rank <= 3
            ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
            : "bg-muted text-muted-foreground"
        )}
      >
        {entry.rank}
      </div>
      <Avatar className="h-8 w-8">
        {entry.avatarUrl && parseAvatarConfig(entry.avatarUrl) ? (
          <NiceAvatar
            style={{ width: "32px", height: "32px" }}
            {...parseAvatarConfig(entry.avatarUrl)!}
          />
        ) : (
          <AvatarFallback className="text-xs">
            {getAvatarFallback(entry.displayName)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {entry.displayName}
          {entry.isCurrentUser && (
            <span className="ml-1 text-xs text-primary font-normal">
              ({t("common.you", "Du")})
            </span>
          )}
        </p>
      </div>
      <div className="text-sm font-medium">
        {entry.totalPoints.toLocaleString()}
      </div>
    </div>
  );

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex flex-wrap items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {t("scoreboard.title", "Rangliste")}
        </CardTitle>
          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {period === "week" ? (
                    <CalendarDays className="h-4 w-4" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  {period === "week"
                    ? t("common.week", "Woche")
                    : t("common.month", "Monat")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setPeriod("week")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {t("common.week", "Woche")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod("month")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("common.month", "Monat")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {scope === "friends" ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  {scope === "friends"
                    ? t("scoreboard.friends", "Freunde")
                    : t("scoreboard.global", "Global")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setScope("friends")}>
                  <Users className="mr-2 h-4 w-4" />
                  {t("scoreboard.friends", "Freunde")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setScope("global")}>
                  <Globe className="mr-2 h-4 w-4" />
                  {t("scoreboard.global", "Global")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-4">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <span className="loading loading-spinner loading-sm"></span>
              </div>
            ) : entriesToShow.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {t("scoreboard.noData", "Keine Daten verfügbar")}
              </p>
            ) : (
              <>
                {entriesToShow.map(renderEntry)}
              </>
            )}
          </div>
        </ScrollArea>
        <div className="mt-4">
        <Button
          asChild
          variant="outline"
          className="w-full justify-center gap-2"
        >
          <Link to="/scoreboard">
            {t("scoreboard.showMore", "Mehr anzeigen")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        </div>
      </CardContent>
    </Card>
  );
}

