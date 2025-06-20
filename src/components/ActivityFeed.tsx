import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from 'react';

interface ActivityFeedItem {
  id: string;
  userName: string;
  userAvatar?: string;
  userFirstName: string;
  userLastName: string;
  activityType: string;
  amount: number;
  points: number;
  workoutTitle: string;
  createdAt: string;
}

const API_URL = 'http://localhost:3001/api';

const getInitials = (displayName: string) => {
  const names = displayName.split(' ');
  return names.map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2);
};

const formatActivity = (activity: ActivityFeedItem) => {
  const { activityType, amount, workoutTitle } = activity;
  
  let formatted = `${amount}`;
  
  // Add unit based on activity type
  switch (activityType) {
    case 'pushups':
    case 'pullups': 
    case 'situps':
      formatted += ' Wiederholungen';
      break;
    case 'running':
    case 'cycling':
      formatted += ' km';
      break;
    case 'other':
      formatted += ' Einheiten';
      break;
    default:
      formatted += ' Einheiten';
  }
  
  if (workoutTitle) {
    formatted += ` in "${workoutTitle}"`;
  }
  
  return formatted;
};

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'pullups':
      return '💪';
    case 'pushups':
      return '🔥';
    case 'situps':
      return '🚀';
    case 'running':
      return '🏃';
    case 'cycling':
      return '🚴';
    case 'other':
      return '🔗';
    default:
      return '💪';
  }
};

const getActivityName = (activityType: string) => {
  switch (activityType) {
    case 'pullups':
      return 'Klimmzüge';
    case 'pushups':
      return 'Liegestütze';
    case 'situps':
      return 'Sit-ups';
    case 'running':
      return 'Laufen';
    case 'cycling':
      return 'Radfahren';
    case 'other':
      return 'Sonstiges';
    default:
      return 'Unbekannte Aktivität';
  }
};

const getActivityColor = (activityType: string) => {
  switch (activityType) {
    case 'pullups': return 'bg-blue-100 text-blue-800';
    case 'pushups': return 'bg-red-100 text-red-800';
    case 'situps': return 'bg-orange-100 text-orange-800';
    case 'running': return 'bg-green-100 text-green-800';
    case 'cycling': return 'bg-purple-100 text-purple-800';
    case 'other': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
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
    return `vor ${diffMins} Min`;
  } else if (diffHours < 24) {
    return `vor ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'gestern';
  } else {
    return `vor ${diffDays}d`;
  }
};

const getUserInitials = (firstName: string, lastName: string) => {
  const first = firstName && firstName.length > 0 ? firstName.charAt(0) : '?';
  const last = lastName && lastName.length > 0 ? lastName.charAt(0) : '?';
  return `${first}${last}`.toUpperCase();
};

export function ActivityFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActivityFeed();
    }
  }, [user]);

  const loadActivityFeed = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/feed?page=1&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        console.log('Activity feed API failed');
      }
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Aktivitäten der Freunde</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg md:text-xl">Aktivitäten der Freunde</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <Avatar className="w-10 h-10 md:w-12 md:h-12">
                  <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                  <AvatarFallback className="text-xs md:text-sm">
                    {getUserInitials(activity.userFirstName, activity.userLastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm md:text-base truncate">
                      {activity.userName}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getActivityColor(activity.activityType)}`}
                    >
                      {getActivityIcon(activity.activityType)} {getActivityName(activity.activityType)}
                    </Badge>
                  </div>
                  
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">
                    <span className="font-medium">{formatActivity(activity)}</span>
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {activity.points} Punkte
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-muted-foreground mb-2">Keine Aktivitäten von Freunden</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Füge Freunde hinzu, um ihre Workouts zu sehen!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 