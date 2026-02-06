import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { API_URL } from "@/lib/api";
import { getBadgeText } from "@/lib/badges";
import { clearAppBadge, setAppBadge } from "@/utils/badge";
import { formatDistanceToNow } from "date-fns";
import { de, enUS } from "date-fns/locale";
import {
  Award,
  Bell,
  CheckCircle,
  Clock,
  Smile,
  Trophy,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  // Legacy types (uppercase)
  FRIEND_REQUEST_RECEIVED: <UserPlus className="w-5 h-5 text-blue-500" />,
  FRIEND_REQUEST_ACCEPTED: <CheckCircle className="w-5 h-5 text-green-500" />,
  // New types (kebab-case)
  "friend-request-received": <UserPlus className="w-5 h-5 text-blue-500" />,
  "friend-request-accepted": <CheckCircle className="w-5 h-5 text-green-500" />,
  "friend-request-declined": <UserMinus className="w-5 h-5 text-red-500" />,
  // Badge & Award types
  "badge-earned": <Award className="w-5 h-5 text-yellow-500" />,
  "award-earned": <Trophy className="w-5 h-5 text-amber-500" />,
  // Invitation types
  "invitation-expired": <Clock className="w-5 h-5 text-orange-500" />,
  "workout-reaction": <Smile className="w-5 h-5 text-pink-500" />,
};

export function Notifications() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isSupported, permission, isRegistering, requestPermission } =
    usePushNotifications();
  const locale = i18n.language === "en" ? enUS : de;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) {
        if (response.status === 404) {
          // Notifications endpoint doesn't exist yet, set empty array
          setNotifications([]);
          return;
        }
        throw new Error(t("common.notificationsCenter.loadError"));
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        setNotifications([]);
        return;
      }

      const mapped: Notification[] = data.map((item) => ({
        id: item.id,
        type: item.type ?? "info",
        title: item.title ?? t("common.notificationsCenter.notificationTitleDefault"),
        message: item.message ?? "",
        payload: item.payload ?? null,
        isRead: Boolean(item.isRead ?? item.is_read ?? item.readAt),
        createdAt:
          item.createdAt ?? item.created_at ?? new Date().toISOString(),
      }));
      setNotifications(mapped);
    } catch (error) {
      // No toast here to avoid spamming on background fetch
      console.error("Notifications fetch error:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

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
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        throw new Error(t("common.notificationsCenter.markReadError"));
      }

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("common.notificationsCenter.unknownError")
      );
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type !== "workout-reaction") {
      return;
    }

    const workoutId =
      typeof notification.payload?.workoutId === "string"
        ? notification.payload.workoutId
        : null;

    if (workoutId) {
      navigate(`/friends/activities?workoutId=${workoutId}`);
    } else {
      navigate("/friends/activities");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label={`${t("common.notificationsCenter.ariaLabel")}${unreadCount > 0 ? `, ${t("common.notificationsCenter.ariaLabelUnread", { count: unreadCount })}` : ""}`}
          aria-expanded={isOpen}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel>{t("common.notificationsCenter.title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isSupported && permission !== "granted" && (
          <div className="px-3 pb-2">
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="font-medium">
                {t("common.notificationsCenter.push.title")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {permission === "denied"
                  ? t("common.notificationsCenter.push.blocked")
                  : t("common.notificationsCenter.push.prompt")}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                disabled={isRegistering || permission === "denied"}
                onClick={() => {
                  requestPermission().catch((error) => {
                    console.error("Push permission error:", error);
                    toast.error(
                      t("common.notificationsCenter.push.requestError")
                    );
                  });
                }}
              >
                {permission === "denied"
                  ? t("common.notificationsCenter.push.openSettings")
                  : isRegistering
                    ? t("common.notificationsCenter.push.enabling")
                    : t("common.notificationsCenter.push.enable")}
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
          <p className="text-sm text-muted-foreground text-center p-4">
            {t("common.notificationsCenter.empty")}
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const icon = notificationIcons[notification.type] ?? (
                <Bell className="w-5 h-5 text-muted-foreground" />
              );
              const badgeLabel =
                notification.type === "badge-earned" &&
                notification.payload &&
                typeof notification.payload.badgeSlug === "string"
                  ? getBadgeText(
                      {
                        slug: notification.payload.badgeSlug as string,
                        level:
                          typeof notification.payload.badgeLevel === "number"
                            ? notification.payload.badgeLevel
                            : null,
                        label:
                          typeof notification.payload.badgeLabel === "string"
                            ? notification.payload.badgeLabel
                            : null,
                        icon:
                          typeof notification.payload.badgeIcon === "string"
                            ? notification.payload.badgeIcon
                            : null,
                        category:
                          typeof notification.payload.badgeCategory === "string"
                            ? notification.payload.badgeCategory
                            : null,
                      },
                      t
                    ).label
                  : null;
              const title =
                notification.type === "badge-earned"
                  ? t("badges.notifications.earnedTitle")
                  : notification.title;
              const message =
                notification.type === "badge-earned" && badgeLabel
                  ? t("badges.notifications.earnedMessage", { badge: badgeLabel })
                  : notification.message;

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-2.5 ${!notification.isRead ? "bg-muted/50" : ""}`}
                  onSelect={(event) => {
                    if (notification.type === "workout-reaction") {
                      event.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  {icon}
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {title}
                    </p>
                    {message && (
                      <p className="text-xs text-muted-foreground leading-snug">
                        {message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        try {
                          const date = new Date(notification.createdAt);
                          if (isNaN(date.getTime())) {
                            return t("common.notificationsCenter.timeAgoFallback");
                          }
                          return formatDistanceToNow(date, {
                            addSuffix: true,
                            locale,
                          });
                        } catch {
                          return t("common.notificationsCenter.timeAgoFallback");
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
