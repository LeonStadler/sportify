import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { API_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Award, Medal } from "lucide-react";

interface FriendBadge {
  id: string;
  slug: string;
  label: string;
  icon?: string | null;
  category: string;
  level?: number | null;
  earnedAt?: string;
}

interface FriendAward {
  id: string;
  type: string;
  label: string;
  periodStart?: string;
  periodEnd?: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
}

interface FriendProfileResponse {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  joinedAt?: string;
  badges: FriendBadge[];
  awards: FriendAward[];
}

const formatDate = (value?: string) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, "dd.MM.yyyy", { locale: de });
  } catch (error) {
    return value;
  }
};

const formatDateRange = (start?: string, end?: string) => {
  const startFormatted = formatDate(start);
  const endFormatted = formatDate(end);
  if (startFormatted && endFormatted) {
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    return `${startFormatted} – ${endFormatted}`;
  }
  return startFormatted || endFormatted;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export function FriendProfile() {
  const { friendId } = useParams();
  const [profile, setProfile] = useState<FriendProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      if (!friendId) {
        setError("Keine Freundes-ID angegeben.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/profile/friends/${friendId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message = payload?.error || "Profil konnte nicht geladen werden.";
          throw new Error(message);
        }

        const data: FriendProfileResponse = await response.json();
        setProfile(data);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setError(
          fetchError instanceof Error ? fetchError.message : "Unbekannter Fehler beim Laden des Profils."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => controller.abort();
  }, [friendId]);

  const sortedBadges = useMemo(() => {
    if (!profile?.badges) return [];
    return [...profile.badges].sort((a, b) => {
      const dateA = a.earnedAt ? new Date(a.earnedAt).getTime() : 0;
      const dateB = b.earnedAt ? new Date(b.earnedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [profile?.badges]);

  const sortedAwards = useMemo(() => {
    if (!profile?.awards) return [];
    return [...profile.awards].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [profile?.awards]);

  const content = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="grid gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      );
    }

    if (!profile) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Kein Profil gefunden.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {profile.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
                ) : null}
                <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
                {profile.joinedAt && (
                  <p className="text-sm text-muted-foreground">
                    Mitglied seit {formatDate(profile.joinedAt)}
                  </p>
                )}
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/friends">
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zu Freunde
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Auszeichnungen
              </CardTitle>
              <UiBadge variant="outline">{sortedAwards.length}</UiBadge>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedAwards.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Auszeichnungen.</p>
              ) : (
                sortedAwards.map((award) => (
                  <div
                    key={award.id}
                    className="rounded-lg border bg-card p-3 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{award.label}</span>
                      <UiBadge variant="secondary" className="text-xs">
                        {award.type}
                      </UiBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateRange(award.periodStart, award.periodEnd) || "Auszeichnung"}
                    </p>
                    {award.metadata && Object.keys(award.metadata).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(award.metadata)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Medal className="h-5 w-5 text-primary" /> Badges
              </CardTitle>
              <UiBadge variant="outline">{sortedBadges.length}</UiBadge>
            </CardHeader>
            <CardContent className="grid gap-3">
              {sortedBadges.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Badges.</p>
              ) : (
                sortedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <div>
                      <p className="font-medium leading-none">{badge.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {badge.category}
                        {badge.level ? ` · Stufe ${badge.level}` : null}
                      </p>
                      {badge.earnedAt && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(badge.earnedAt)}
                        </p>
                      )}
                    </div>
                    {badge.icon ? (
                      <UiBadge variant="secondary" className="text-xs uppercase">
                        {badge.icon}
                      </UiBadge>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return <div className="space-y-6">{content()}</div>;
}

export default FriendProfile;
