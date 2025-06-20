import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; // Diese Zeile fehlt oder ist falsch platziert
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/use-debounce';
import {
    Check,
    Search,
    UserPlus,
    Users,
    X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  
  if (!user) return null;

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold">Freunde</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Vernetze dich mit anderen Sportlern und vergleiche eure Leistungen.
        </p>
      </div>
      
      <div className="px-4 md:px-0">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="text-xs md:text-sm">Meine Freunde</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs md:text-sm">Anfragen</TabsTrigger>
            <TabsTrigger value="search" className="text-xs md:text-sm">Finden</TabsTrigger>
          </TabsList>
          <TabsContent value="friends" className="mt-4 md:mt-6">
            <FriendsList />
          </TabsContent>
          <TabsContent value="requests" className="mt-4 md:mt-6">
            <FriendRequestsList />
          </TabsContent>
          <TabsContent value="search" className="mt-4 md:mt-6">
            <UserSearch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


// #region Sub-components

function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/friends', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Fehler beim Laden der Freunde.');
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleRemoveFriend = async (friendshipId: string, friendName: string) => {
    const promise = fetch(`/api/friends/${friendshipId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    toast.promise(promise, {
      loading: 'Entferne Freund...',
      success: () => {
        fetchFriends(); // Refresh the list
        return `${friendName} wurde aus deiner Freundesliste entfernt.`;
      },
      error: 'Fehler beim Entfernen des Freundes.'
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
                    <AvatarImage src={friend.avatarUrl} alt={friend.displayName} />
                    <AvatarFallback className="text-xs md:text-sm">
                      {getInitials(friend.firstName, friend.lastName)}
                    </AvatarFallback>
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


function FriendRequestsList() {
    const [requests, setRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({ incoming: [], outgoing: [] });
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/friends/requests', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Fehler beim Laden der Anfragen.');
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleRequestAction = async (requestId: string, action: 'accept' | 'decline') => {
        const promise = fetch(`/api/friends/requests/${requestId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action })
        });

        toast.promise(promise, {
            loading: 'Bearbeite Anfrage...',
            success: () => {
                fetchRequests();
                return `Anfrage ${action === 'accept' ? 'angenommen' : 'abgelehnt'}.`;
            },
            error: 'Fehler bei der Bearbeitung der Anfrage.'
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
                                            <AvatarImage src={req.user.avatarUrl} alt={req.user.displayName} />
                                            <AvatarFallback className="text-xs md:text-sm">
                                                {getInitials(req.user.firstName, req.user.lastName)}
                                            </AvatarFallback>
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
                                            <AvatarImage src={req.user.avatarUrl} alt={req.user.displayName} />
                                            <AvatarFallback className="text-xs md:text-sm">
                                                {getInitials(req.user.firstName, req.user.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p className="font-semibold text-sm md:text-base truncate">{req.user.displayName}</p>
                                    </div>
                                    <Badge variant="secondary" className="flex-shrink-0 text-xs">Ausstehend</Badge>
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
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(debouncedQuery)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Fehler bei der Benutzersuche.');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.');
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);
  
  const handleSendRequest = async (targetUserId: string, targetName: string) => {
    const promise = fetch('/api/friends/requests', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId })
    });

    toast.promise(promise, {
        loading: `Sende Anfrage an ${targetName}...`,
        success: (res) => {
           if (!res.ok) {
               return res.json().then(err => { throw new Error(err.error) });
           }
           return `Freundschaftsanfrage an ${targetName} gesendet.`;
        },
        error: (err) => err.message || 'Fehler beim Senden der Anfrage.'
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
          <p className="text-muted-foreground text-center py-4 text-sm md:text-base">Keine Benutzer gefunden.</p>
        )}

        <div className="space-y-3 md:space-y-4">
            {results.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 md:p-0">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 md:w-12 md:h-12">
                            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                            <AvatarFallback className="text-xs md:text-sm">
                                {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
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