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
import { Bell, CheckCircle, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'FRIEND_REQUEST_RECEIVED' | 'FRIEND_REQUEST_ACCEPTED';
  isRead: boolean;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  avatarUrl?: string;
}

const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
};

const notificationContent = {
  FRIEND_REQUEST_RECEIVED: {
    icon: <UserPlus className="w-5 h-5 text-blue-500" />,
    message: (name: string) => `Du hast eine Freundschaftsanfrage von ${name}.`,
  },
  FRIEND_REQUEST_ACCEPTED: {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    message: (name: string) => `${name} hat deine Freundschaftsanfrage angenommen.`,
  },
};

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/notifications', {
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
      setNotifications(Array.isArray(data) ? data : []);
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

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const response = await fetch('http://localhost:3001/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Fehler beim Markieren als gelesen.');
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
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
              const content = notificationContent[notification.type];
              if (!content) return null;
              
              const displayName = notification.nickname || `${notification.firstName} ${notification.lastName}`;

              return (
                <DropdownMenuItem key={notification.id} className={`flex items-start gap-3 p-2.5 ${!notification.isRead ? 'bg-muted/50' : ''}`}>
                  {content.icon}
                  <div className="flex-1">
                    <p className="text-sm">{content.message(displayName)}</p>
                    <p className="text-xs text-muted-foreground">
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
                   {!notification.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 self-center" />}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 