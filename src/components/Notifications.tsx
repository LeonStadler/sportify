import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Award, Bell, CheckCircle, Trophy, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { setAppBadge, clearAppBadge } from '@/utils/badge';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}


const notificationIcons: Record<string, JSX.Element> = {
  FRIEND_REQUEST_RECEIVED: <UserPlus className="w-5 h-5 text-blue-500" />,
  FRIEND_REQUEST_ACCEPTED: <CheckCircle className="w-5 h-5 text-green-500" />,
  'badge-earned': <Award className="w-5 h-5 text-yellow-500" />,
  'award-earned': <Trophy className="w-5 h-5 text-amber-500" />,
};

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { isSupported, permission, isRegistering, requestPermission } = usePushNotifications();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        if (response.status === 404) {
          // Notifications endpoint doesn't exist yet, set empty array
          setNotifications([]);
          return;
        }
        throw new Error('Benachrichtigungen konnten nicht geladen werden.');
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        setNotifications([]);
        return;
      }

      const mapped: Notification[] = data.map((item) => ({
        id: item.id,
        type: item.type ?? 'info',
        title: item.title ?? 'Benachrichtigung',
        message: item.message ?? '',
        payload: item.payload ?? null,
        isRead: Boolean(item.isRead ?? item.is_read ?? item.readAt),
        createdAt: item.createdAt ?? item.created_at ?? new Date().toISOString(),
      }));
      setNotifications(mapped);
    } catch (error) {
      // No toast here to avoid spamming on background fetch
      console.error('Notifications fetch error:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Update Badge wenn sich unreadCount ändert
  useEffect(() => {
    if (unreadCount > 0) {
      setAppBadge(unreadCount);
    } else {
      clearAppBadge();
    }
  }, [unreadCount]);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const response = await fetch(`${API_URL}/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Fehler beim Markieren als gelesen.');
      
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unbekannter Fehler');
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if(open && unreadCount > 0) {
        markAllAsRead();
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel>Benachrichtigungen</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isSupported && permission !== 'granted' && (
          <div className="px-3 pb-2">
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="font-medium">Push-Benachrichtigungen aktivieren</p>
              <p className="text-xs text-muted-foreground mt-1">
                {permission === 'denied'
                  ? 'Benachrichtigungen sind aktuell im Browser blockiert. Erlaube Mitteilungen in den Einstellungen deines Geräts, um Updates zu erhalten.'
                  : 'Erhalte Auszeichnungen und Freundes-Updates direkt als Mitteilung auf deinem Gerät.'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                disabled={isRegistering || permission === 'denied'}
                onClick={() => {
                  requestPermission().catch((error) => {
                    console.error('Push permission error:', error);
                    toast.error('Push-Benachrichtigungen konnten nicht aktiviert werden.');
                  });
                }}
              >
                {permission === 'denied'
                  ? 'In Einstellungen aktivieren'
                  : isRegistering
                    ? 'Aktiviere...'
                    : 'Jetzt aktivieren'}
              </Button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="p-2 space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center p-4">Keine neuen Benachrichtigungen.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const icon = notificationIcons[notification.type] ?? (
                <Bell className="w-5 h-5 text-muted-foreground" />
              );

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-2.5 ${!notification.isRead ? 'bg-muted/50' : ''}`}
                >
                  {icon}
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">{notification.title}</p>
                    {notification.message && (
                      <p className="text-xs text-muted-foreground leading-snug">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        try {
                          const date = new Date(notification.createdAt);
                          if (isNaN(date.getTime())) {
                            return 'Vor einiger Zeit';
                          }
                          return formatDistanceToNow(date, { addSuffix: true, locale: de });
                        } catch {
                          return 'Vor einiger Zeit';
                        }
                      })()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 self-center" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
