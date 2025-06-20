import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";

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
}

const getUnitForActivity = (activity: string) => {
    switch (activity) {
      case "pullups":
      case "pushups":
      case "situps":
        return "Wdh.";
      case "running":
      case "cycling":
        return "km";
      case "other":
        return "Einheiten";
      default:
        return "Punkte";
    }
}

export function ScoreboardTable({ activity, period }: ScoreboardTableProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:3001/api/scoreboard/`;
      if (activity === 'all') {
          url += `overall?period=${period}`;
      } else {
          url += `activity/${activity}?period=${period}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Fehler beim Laden des Scoreboards");
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard);

    } catch (error) {
      console.error("Scoreboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activity, period]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);
  
  const getAvatarFallback = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const getRankColor = (rank: number) => {
      if (rank === 1) return "text-yellow-500";
      if (rank === 2) return "text-gray-400";
      if (rank === 3) return "text-orange-600";
      return "text-gray-600";
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center p-4 h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
      return (
          <div className="text-center py-12">
              <p className="text-gray-500">Keine Daten für diese Rangliste vorhanden.</p>
              <p className="text-sm text-gray-400 mt-1">Nimm an Workouts teil, um in der Rangliste zu erscheinen.</p>
          </div>
      )
  }

  return (
        <div className="space-y-4">
      {leaderboard.map((player) => (
            <div 
          key={player.id} 
              className={`
                flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md
            ${player.isCurrentUser ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
              <span className={`text-lg font-bold w-8 text-center ${getRankColor(player.rank)}`}>
                {player.rank}
                  </span>
              <Avatar>
                <AvatarImage src={player.avatarUrl || undefined} alt={player.displayName} />
                <AvatarFallback className={`${player.isCurrentUser ? 'bg-orange-500 text-white' : 'bg-slate-600 text-white'}`}>
                    {getAvatarFallback(player.displayName)}
                </AvatarFallback>
              </Avatar>
                </div>
                <div>
              <p className="font-semibold text-gray-900">{player.displayName}</p>
              {activity === 'overall' && (
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Klimmzüge: {player.totalPullups || 0}
                  </Badge>
                    <Badge variant="outline" className="text-xs">
                    Liegestütze: {player.totalPushups || 0}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                    Laufen: {player.totalRunning || 0} km
                    </Badge>
                  </div>
              )}
                </div>
              </div>
              <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
                {activity === 'overall' ? player.totalPoints : player.totalAmount}
            </p>
            <p className="text-sm text-gray-500">{getUnitForActivity(activity)}</p>
              </div>
            </div>
          ))}
        </div>
  );
}
