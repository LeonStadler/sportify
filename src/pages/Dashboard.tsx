import { ActivityFeed } from "@/components/ActivityFeed";
import { PageTemplate } from "@/components/PageTemplate";
import { StatCard } from "@/components/StatCard";
import { WeeklyChallengeCard } from "@/components/WeeklyChallengeCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Dumbbell, TrendingUp, Trophy } from "lucide-react";
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { useTranslation } from 'react-i18next';

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


export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

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
  const [recentWorkoutsError, setRecentWorkoutsError] = useState<string | null>(null);
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
        title: t('dashboard.error'),
        description: t('dashboard.errorLoadingData'),
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
      setRecentWorkoutsError(null);

      if (!token) {
        setRecentWorkouts([]);
        setRecentWorkoutsError(t('dashboard.pleaseLoginWorkouts'));
        return;
      }

      const response = await fetch(`${API_URL}/recent-workouts?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const workouts = Array.isArray(data) ? data : data?.workouts;

        if (Array.isArray(workouts)) {
          setRecentWorkouts(workouts.map((workout) => ({
            ...workout,
            activities: Array.isArray(workout.activities) ? workout.activities.map((activity) => ({
              activityType: activity.activityType,
              amount: activity.amount ?? activity.quantity ?? 0,
              points: activity.points ?? 0,
            })) : []
          })));
        } else {
          setRecentWorkouts([]);
          setRecentWorkoutsError(t('dashboard.unexpectedFormat'));
        }
      } else {
        setRecentWorkouts([]);
        setRecentWorkoutsError(t('dashboard.workoutsNotLoaded'));
        toast({
          title: t('dashboard.error'),
          description: t('dashboard.errorLoadingWorkouts'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading recent workouts:', error);
      setRecentWorkouts([]);
      setRecentWorkoutsError(t('dashboard.workoutsNotLoaded'));
      toast({
        title: t('dashboard.error'),
        description: t('dashboard.errorLoadingWorkouts'),
        variant: 'destructive',
      });
    }
  };

  const formatActivityName = (activityType: string) => {
    const activityKey = activityType.toLowerCase();
    const translationKey = `dashboard.activityTypes.${activityKey}`;
    const translation = t(translationKey);
    // Fallback to original if translation key doesn't exist
    return translation !== translationKey ? translation : activityType;
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
      return t('dashboard.timeAgo.minutes', { count: diffMins });
    } else if (diffHours < 24) {
      return t('dashboard.timeAgo.hours', { count: diffHours });
    } else if (diffDays === 1) {
      return t('dashboard.timeAgo.yesterday');
    } else {
      return t('dashboard.timeAgo.days', { count: diffDays });
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
      <PageTemplate
        title={t('dashboard.title')}
        subtitle={t('dashboard.loadingProgress')}
      >
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
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
    >

      {recentWorkoutsError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {recentWorkoutsError}
        </div>
      )}

      {/* Stats Grid - Mobile optimiert */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title={t('dashboard.totalPoints')}
          value={stats.totalPoints.toLocaleString()}
          icon={Trophy}
          trend={`+${stats.weekPoints} ${t('dashboard.thisWeek')}`}
          color="orange"
        />
        <StatCard
          title={t('dashboard.pullups')}
          value={stats.activities.pullups.total.toString()}
          icon={Dumbbell}
          trend={`+${stats.activities.pullups.week} ${t('dashboard.thisWeek')}`}
          color="blue"
        />
        <StatCard
          title={t('dashboard.runningDistance')}
          value={`${stats.activities.running.total} km`}
          icon={TrendingUp}
          trend={`+${stats.activities.running.week} km ${t('dashboard.thisWeek')}`}
          color="green"
        />
        <StatCard
          title={t('dashboard.rank')}
          value={`#${stats.userRank}`}
          icon={BarChart}
          trend={t('dashboard.ofAthletes', { count: stats.totalUsers })}
          color="purple"
        />
      </div>

      {/* Progress Section - Mobile Stack Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl">{t('dashboard.weeklyGoals')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('dashboard.pullups')} ({t('dashboard.goal')}: {goals.pullups.target})</span>
                <span className="font-medium">{goals.pullups.current}/{goals.pullups.target}</span>
              </div>
              <Progress 
                value={Math.min((goals.pullups.current / goals.pullups.target) * 100, 100)} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('dashboard.pushups')} ({t('dashboard.goal')}: {goals.pushups.target})</span>
                <span className="font-medium">{goals.pushups.current}/{goals.pushups.target}</span>
              </div>
              <Progress 
                value={Math.min((goals.pushups.current / goals.pushups.target) * 100, 100)} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('dashboard.running')} ({t('dashboard.goal')}: {goals.running.target} km)</span>
                <span className="font-medium">{goals.running.current}/{goals.running.target} km</span>
              </div>
              <Progress 
                value={Math.min((goals.running.current / goals.running.target) * 100, 100)} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('dashboard.cycling')} ({t('dashboard.goal')}: {goals.cycling.target} km)</span>
                <span className="font-medium">{goals.cycling.current}/{goals.cycling.target} km</span>
              </div>
              <Progress 
                value={Math.min((goals.cycling.current / goals.cycling.target) * 100, 100)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
        <WeeklyChallengeCard className="xl:col-span-2" />
      </div>

        <ActivityFeed />
    </PageTemplate>
  );
}
