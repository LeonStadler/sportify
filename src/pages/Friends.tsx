import { InviteFriendForm } from '@/components/InviteFriendForm';
import { PageTemplate } from '@/components/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/use-debounce';
import { API_URL } from '@/lib/api';
import { parseAvatarConfig } from '@/lib/avatar';
import {
  Check,
  Search,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NiceAvatar from 'react-nice-avatar';
import { toast } from 'sonner';

// Type definitions based on API responses
interface UserSearchResult {
  id: string;
  displayName: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
}

interface Friend extends UserSearchResult {
  friendshipId: string;
}

interface BackendFriend {
  id: string;
  friendshipId: string;
  displayName: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
}

interface FriendRequest {
  type: 'incoming' | 'outgoing';
  requestId: string;
  user: UserSearchResult;
  createdAt: string;
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
};


// Main Friends Component
export function Friends() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user) return null;

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <PageTemplate
      title={t('friends.title', 'Freunde')}
      subtitle={t('friends.subtitle', 'Vernetze dich mit anderen Sportlern und vergleiche eure Leistungen.')}
    >
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends" className="text-xs md:text-sm">Meine Freunde</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs md:text-sm">Anfragen</TabsTrigger>
          <TabsTrigger value="search" className="text-xs md:text-sm">Finden</TabsTrigger>
        </TabsList>
        <TabsContent value="friends" className="mt-4 md:mt-6">
          <FriendsList key={`friends-${refreshKey}`} />
        </TabsContent>
        <TabsContent value="requests" className="mt-4 md:mt-6">
          <FriendRequestsList key={`requests-${refreshKey}`} onFriendAccepted={handleRefresh} />
        </TabsContent>
        <TabsContent value="search" className="mt-4 md:mt-6">
          <UserSearch />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}


// #region Sub-components

function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/friends`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Fehler beim Laden der Freunde.';

        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
        }

        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Ungültige Antwort vom Server. Bitte versuche es erneut.');
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const mappedFriends: Friend[] = data.map((friend: any) => {
          // Backend gibt friendshipId zurück (von friendship_id nach toCamelCase)
          return {
            id: friend.id,
            friendshipId: friend.friendshipId || friend.friendship_id,
            displayName: friend.displayName || friend.display_name || `${friend.firstName} ${friend.lastName}`,
            avatarUrl: friend.avatarUrl || friend.avatar_url,
            firstName: friend.firstName || friend.first_name,
            lastName: friend.lastName || friend.last_name
          };
        });
        setFriends(mappedFriends);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        toast.error('Ungültige Serverantwort. Bitte aktualisiere die Seite.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.');
      }
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleRemoveFriend = async (friendshipId: string, friendName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Nicht angemeldet.');
      return;
    }

    const promise = fetch(`${API_URL}/friends/${friendshipId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(async (response) => {
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Fehler beim Entfernen des Freundes.';

        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch (parseError) {
            // If JSON parsing fails, use default message
          }
        }

        throw new Error(errorMessage);
      }
      return response;
    });

    toast.promise(promise, {
      loading: 'Entferne Freund...',
      success: () => {
        fetchFriends();
        return `${friendName} wurde aus deiner Freundesliste entfernt.`;
      },
      error: (error) => error instanceof Error ? error.message : 'Fehler beim Entfernen des Freundes.'
    });
  };

  if (loading) {
    return <Card><CardContent className="p-4 md:p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg md:text-xl">Meine Freunde ({friends.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {friends.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Noch keine Freunde hinzugefügt.</p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Verwende die Suche, um andere Athleten zu finden!
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {friends.map(friend => (
              <div key={friend.id} className="flex items-center justify-between p-3 md:p-0">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <Avatar className="w-10 h-10 md:w-12 md:h-12">
                    {friend.avatarUrl && parseAvatarConfig(friend.avatarUrl) ? (
                      <NiceAvatar
                        style={{ width: friend.avatarUrl ? '48px' : '40px', height: friend.avatarUrl ? '48px' : '40px' }}
                        {...parseAvatarConfig(friend.avatarUrl)!}
                      />
                    ) : (
                      <AvatarFallback className="text-xs md:text-sm">
                        {getInitials(friend.firstName, friend.lastName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p className="font-semibold text-sm md:text-base truncate">{friend.displayName}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveFriend(friend.friendshipId, friend.displayName)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-shrink-0 text-xs md:text-sm"
                >
                  <span className="hidden sm:inline">Entfernen</span>
                  <span className="sm:hidden">×</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


function FriendRequestsList({ onFriendAccepted }: { onFriendAccepted?: () => void }) {
  const [requests, setRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/friends/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Anfragen.');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Ungültige Antwort vom Server. Bitte versuche es erneut.');
      }

      const data = await response.json();
      setRequests({
        incoming: Array.isArray(data.incoming) ? data.incoming : [],
        outgoing: Array.isArray(data.outgoing) ? data.outgoing : []
      });
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        toast.error('Ungültige Serverantwort. Bitte aktualisiere die Seite.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.');
      }
      setRequests({ incoming: [], outgoing: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRequestAction = async (requestId: string, action: 'accept' | 'decline') => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Nicht angemeldet.');
      return;
    }

    const promise = fetch(`${API_URL}/friends/requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action })
    }).then(async (response) => {
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Fehler bei der Bearbeitung der Anfrage.';

        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch (parseError) {
            // If JSON parsing fails, use default message
          }
        }

        throw new Error(errorMessage);
      }
      return response;
    });

    toast.promise(promise, {
      loading: 'Bearbeite Anfrage...',
      success: () => {
        fetchRequests();
        if (action === 'accept' && onFriendAccepted) {
          // Small delay to ensure backend has processed the request
          setTimeout(() => {
            onFriendAccepted();
          }, 100);
        }
        return `Anfrage ${action === 'accept' ? 'angenommen' : 'abgelehnt'}.`;
      },
      error: (error) => error instanceof Error ? error.message : 'Fehler bei der Bearbeitung der Anfrage.'
    });
  };

  const handleCancelRequest = async (requestId: string, userName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Nicht angemeldet.');
      return;
    }

    const promise = fetch(`${API_URL}/friends/requests/${requestId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(async (response) => {
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Fehler beim Zurückziehen der Anfrage.';

        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch (parseError) {
            // If JSON parsing fails, use default message
          }
        }

        throw new Error(errorMessage);
      }
      return response;
    });

    toast.promise(promise, {
      loading: 'Ziehe Anfrage zurück...',
      success: () => {
        fetchRequests();
        return `Anfrage an ${userName} wurde zurückgezogen.`;
      },
      error: (error) => error instanceof Error ? error.message : 'Fehler beim Zurückziehen der Anfrage.'
    });
  };

  if (loading) {
    return <Card><CardContent className="p-4 md:p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Eingehende Anfragen ({requests.incoming.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.incoming.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm md:text-base">Keine eingehenden Anfragen.</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {requests.incoming.map(req => (
                <div key={req.requestId} className="flex items-center justify-between p-3 md:p-0">
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <Avatar className="w-10 h-10 md:w-12 md:h-12">
                      {req.user.avatarUrl && parseAvatarConfig(req.user.avatarUrl) ? (
                        <NiceAvatar
                          style={{ width: '48px', height: '48px' }}
                          {...parseAvatarConfig(req.user.avatarUrl)!}
                        />
                      ) : (
                        <AvatarFallback className="text-xs md:text-sm">
                          {getInitials(req.user.firstName, req.user.lastName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <p className="font-semibold text-sm md:text-base truncate">{req.user.displayName}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                      onClick={() => handleRequestAction(req.requestId, 'accept')}
                    >
                      <Check className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline ml-1">Akzeptieren</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
                      onClick={() => handleRequestAction(req.requestId, 'decline')}
                    >
                      <X className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline ml-1">Ablehnen</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Ausgehende Anfragen ({requests.outgoing.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.outgoing.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm md:text-base">Keine gesendeten Anfragen.</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {requests.outgoing.map(req => (
                <div key={req.requestId} className="flex items-center justify-between p-3 md:p-0">
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <Avatar className="w-10 h-10 md:w-12 md:h-12">
                      {req.user.avatarUrl && parseAvatarConfig(req.user.avatarUrl) ? (
                        <NiceAvatar
                          style={{ width: '48px', height: '48px' }}
                          {...parseAvatarConfig(req.user.avatarUrl)!}
                        />
                      ) : (
                        <AvatarFallback className="text-xs md:text-sm">
                          {getInitials(req.user.firstName, req.user.lastName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <p className="font-semibold text-sm md:text-base truncate">{req.user.displayName}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelRequest(req.requestId, req.user.displayName)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-shrink-0 text-xs md:text-sm"
                  >
                    <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Zurückziehen</span>
                    <span className="sm:hidden">×</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function UserSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(debouncedQuery)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage = 'Fehler bei der Benutzersuche.';

          if (contentType && contentType.includes('application/json')) {
            try {
              const error = await response.json();
              errorMessage = error.error || error.message || errorMessage;
            } catch (parseError) {
              // If JSON parsing fails, use default message
            }
          }

          throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Ungültige Antwort vom Server. Bitte versuche es erneut.');
        }

        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error searching users:', error);
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
          toast.error('Ungültige Serverantwort. Bitte versuche es erneut.');
        } else {
          toast.error(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.');
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const handleSendRequest = async (targetUserId: string, targetName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Nicht angemeldet.');
      return;
    }

    const promise = fetch(`${API_URL}/friends/requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetUserId })
    }).then(async (response) => {
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Fehler beim Senden der Anfrage.';

        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            console.error('Friend request error response:', error);
            errorMessage = error.error || error.message || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text);
        }

        throw new Error(errorMessage);
      }
      return response;
    });

    toast.promise(promise, {
      loading: `Sende Anfrage an ${targetName}...`,
      success: () => {
        // Remove user from search results after successful request
        setResults(prev => prev.filter(user => user.id !== targetUserId));
        return `Freundschaftsanfrage an ${targetName} gesendet.`;
      },
      error: (err) => {
        let errorMessage = 'Fehler beim Senden der Anfrage.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        return errorMessage;
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg md:text-xl">Andere Athleten finden</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Namen oder E-Mail suchen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading && <Skeleton className="h-20 w-full" />}

        {!loading && debouncedQuery.length > 1 && results.length === 0 && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center py-2 text-sm md:text-base">Keine Benutzer gefunden.</p>
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="text-sm font-semibold mb-2">Person einladen</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Die Person wurde nicht gefunden. Lade sie ein, Sportify zu nutzen.
              </p>
              <InviteFriendForm />
            </div>
          </div>
        )}

        <div className="space-y-3 md:space-y-4">
          {results.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 md:p-0">
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <Avatar className="w-10 h-10 md:w-12 md:h-12">
                  {user.avatarUrl && parseAvatarConfig(user.avatarUrl) ? (
                    <NiceAvatar
                      style={{ width: '48px', height: '48px' }}
                      {...parseAvatarConfig(user.avatarUrl)!}
                    />
                  ) : (
                    <AvatarFallback className="text-xs md:text-sm">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <p className="font-semibold text-sm md:text-base truncate">{user.displayName}</p>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendRequest(user.id, user.displayName)}
                className="flex-shrink-0 text-xs md:text-sm"
              >
                <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Anfragen</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// #endregion 