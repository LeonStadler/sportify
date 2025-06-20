import { ActivityFeed } from "@/components/ActivityFeed";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Dumbbell, TrendingUp, Trophy } from "lucide-react";
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalPoints: number;
  weekPoints: number;
  totalWorkouts: number;
  userRank: number;
  totalUsers: number;
  activities: {
    pullups: { total: number; week: number; };
    pushups: { total: number; week: number; };
    running: { total: number; week: number; };
    cycling: { total: number; week: number; };
  };
}

interface Goals {
  pullups: { target: number; current: number; };
  pushups: { target: number; current: number; };
  running: { target: number; current: number; };
  cycling: { target: number; current: number; };
}

interface RecentWorkout {
  id: string;
  createdAt: string;
  notes?: string;
  activities: Array<{
    activityType: string;
    amount: number;
    points: number;
  }>;
}

const API_URL = 'http://localhost:3001/api';

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    totalPoints: 0,
    weekPoints: 0,
    totalWorkouts: 0,
    userRank: 1,
    totalUsers: 1,
    activities: {
      pullups: { total: 0, week: 0 },
      pushups: { total: 0, week: 0 },
      running: { total: 0, week: 0 },
      cycling: { total: 0, week: 0 }
    }
  });

  const [goals, setGoals] = useState<Goals>({
    pullups: { target: 100, current: 0 },
    pushups: { target: 400, current: 0 },
    running: { target: 25, current: 0 },
    cycling: { target: 100, current: 0 }
  });

  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await Promise.all([
        loadStats(token),
        loadGoals(token),
        loadRecentWorkouts(token)
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Dashboard-Daten",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Set default values if API fails
        console.log('Stats API failed, using defaults');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadGoals = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/goals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadRecentWorkouts = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/recent-workouts?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentWorkouts(data);
      }
    } catch (error) {
      console.error('Error loading recent workouts:', error);
    }
  };

  const formatActivityName = (activityType: string) => {
    switch (activityType) {
      case 'pullup': return 'Klimmzüge';
      case 'pushup': return 'Liegestütze';
      case 'running': return 'Laufen';
      case 'cycling': return 'Radfahren';
      default: return activityType;
    }
  };

  const formatActivityAmount = (activityType: string, amount: number) => {
    switch (activityType) {
      case 'pullup':
      case 'pushup':
        return `${amount}x`;
      case 'running':
      case 'cycling':
        return `${amount} km`;
      default:
        return `${amount}`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `vor ${diffMins} Minuten`;
    } else if (diffHours < 24) {
      return `vor ${diffHours} Stunden`;
    } else if (diffDays === 1) {
      return 'gestern';
    } else {
      return `vor ${diffDays} Tagen`;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'pullup': return 'bg-orange-50 border-orange-200';
      case 'pushup': return 'bg-blue-50 border-blue-200';
      case 'running': return 'bg-green-50 border-green-200';
      case 'cycling': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityDotColor = (activityType: string) => {
    switch (activityType) {
      case 'pullup': return 'bg-orange-500';
      case 'pushup': return 'bg-blue-500';
      case 'running': return 'bg-green-500';
      case 'cycling': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Lädt deine sportlichen Fortschritte...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">Deine sportlichen Fortschritte auf einen Blick</p>
      </div>

      {/* Stats Grid - Mobile optimiert */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 px-4 md:px-0">
        <StatCard
          title="Gesamtpunkte"
          value={stats.totalPoints.toLocaleString()}
          icon={Trophy}
          trend={`+${stats.weekPoints} diese Woche`}
          color="orange"
        />
        <StatCard
          title="Klimmzüge"
          value={stats.activities.pullups.total.toString()}
          icon={Dumbbell}
          trend={`+${stats.activities.pullups.week} diese Woche`}
          color="blue"
        />
        <StatCard
          title="Laufdistanz"
          value={`${stats.activities.running.total} km`}
          icon={TrendingUp}
          trend={`+${stats.activities.running.week} km diese Woche`}
          color="green"
        />
        <StatCard
          title="Rang"
          value={`#${stats.userRank}`}
          icon={BarChart}
          trend={`von ${stats.totalUsers} Athleten`}
          color="purple"
        />
      </div>

      {/* Progress Section - Mobile Stack Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl">Wochenziele</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Klimmzüge (Ziel: {goals.pullups.target})</span>
                <span className="font-medium">{goals.pullups.current}/{goals.pullups.target}</span>
              </div>
              <Progress 
                value={Math.min((goals.pullups.current / goals.pullups.target) * 100, 100)} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Liegestütze (Ziel: {goals.pushups.target})</span>
                <span className="font-medium">{goals.pushups.current}/{goals.pushups.target}</span>
              </div>
              <Progress 
                value={Math.min((goals.pushups.current / goals.pushups.target) * 100, 100)} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Laufen (Ziel: {goals.running.target} km)</span>
                <span className="font-medium">{goals.running.current}/{goals.running.target} km</span>
              </div>
              <Progress 
                value={Math.min((goals.running.current / goals.running.target) * 100, 100)} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Radfahren (Ziel: {goals.cycling.target} km)</span>
                <span className="font-medium">{goals.cycling.current}/{goals.cycling.target} km</span>
              </div>
              <Progress 
                value={Math.min((goals.cycling.current / goals.cycling.target) * 100, 100)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <ActivityFeed />
      </div>
    </div>
  );
}
