import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Globe, Monitor, Moon, Palette, Settings, Shield, Sun, UserPlus, Users } from "lucide-react";
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  isEmailVerified: boolean;
  has2FA: boolean;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface Invitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  invitedByFirstName?: string;
  invitedByLastName?: string;
}

const API_URL = 'http://localhost:3001/api';

export function Admin() {
  const { user, inviteUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });

  // Settings states
  const [defaultTheme, setDefaultTheme] = useState(theme || 'system');
  const [showEmails, setShowEmails] = useState(false);

  // Lade Daten beim Komponenten-Mount
  useEffect(() => {
    if (user?.isAdmin) {
      loadAdminData();
    }
  }, [user?.isAdmin]);

  // Prüfe Admin-Rechte
  if (!user?.isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Zugriff verweigert</h2>
              <p className="text-muted-foreground">
                Sie haben keine Berechtigung, auf den Admin-Bereich zuzugreifen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadUsers(), loadInvitations()]);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Admin-Daten",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const invitationsData = await response.json();
        setInvitations(invitationsData);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteUser(inviteForm.email, inviteForm.firstName, inviteForm.lastName);
      toast({
        title: "Einladung gesendet",
        description: `Einladung wurde an ${inviteForm.email} gesendet.`,
      });
      
      // Reset form and reload data
      setInviteForm({ email: '', firstName: '', lastName: '' });
      await loadInvitations();
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Senden der Einladung",
        variant: "destructive",
      });
    }
  };

  const handleSaveThemeSettings = () => {
    setTheme(defaultTheme);
    toast({
      title: "Einstellungen gespeichert",
      description: `Standard-Theme auf "${defaultTheme}" gesetzt.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maskEmail = (email: string) => {
    if (showEmails) return email;
    const [name, domain] = email.split('@');
    return `${name.substring(0, 2)}***@${domain}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Verwaltung der App-Einstellungen und Benutzer
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Sie sind als Administrator angemeldet und haben vollständigen Zugriff auf alle Einstellungen.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Invitation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Benutzer einladen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteUser} className="space-y-4">
            <div>
                <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                <Input 
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="benutzer@example.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="invite-firstname">Vorname</Label>
                  <Input
                    id="invite-firstname"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Max"
                  />
            </div>
            <div>
                  <Label htmlFor="invite-lastname">Nachname</Label>
                <Input 
                    id="invite-lastname"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Mustermann"
                  />
              </div>
            </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Wird gesendet..." : "Einladung senden"}
            </Button>
            </form>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme-Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Aktuelles Theme</Label>
              <Select value={defaultTheme} onValueChange={setDefaultTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Theme auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Hell
            </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dunkel
            </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      System
            </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveThemeSettings} className="w-full" variant="outline">
              Theme anwenden
            </Button>
          </CardContent>
        </Card>

        {/* App Statistics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              App-Statistiken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{users.length}</p>
                <p className="text-sm text-muted-foreground">Registrierte Benutzer</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.isEmailVerified).length}
                </p>
                <p className="text-sm text-muted-foreground">Verifizierte E-Mails</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.isAdmin).length}
                </p>
                <p className="text-sm text-muted-foreground">Administratoren</p>
            </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {invitations.filter(i => i.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Ausstehende Einladungen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Benutzer-Verwaltung
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmails(!showEmails)}
              >
                {showEmails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showEmails ? "E-Mails verbergen" : "E-Mails anzeigen"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erstellt</TableHead>
                      <TableHead>Letzter Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((adminUser) => (
                      <TableRow key={adminUser.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {adminUser.firstName} {adminUser.lastName}
                            </p>
                            {adminUser.nickname && (
                              <p className="text-sm text-muted-foreground">
                                "{adminUser.nickname}"
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-mono text-sm">
                            {maskEmail(adminUser.email)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {adminUser.isAdmin && (
                              <Badge variant="secondary">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            {adminUser.isEmailVerified && (
                              <Badge variant="outline" className="text-green-600">
                                ✓ Verifiziert
                              </Badge>
                            )}
                            {adminUser.has2FA && (
                              <Badge variant="outline" className="text-blue-600">
                                🔒 2FA
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(adminUser.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {adminUser.lastLoginAt 
                            ? formatDate(adminUser.lastLoginAt)
                            : "Nie"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </div>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Keine Benutzer gefunden</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Ausstehende Einladungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.length > 0 ? (
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <div 
                      key={invitation.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {invitation.firstName} {invitation.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {maskEmail(invitation.email)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Eingeladen: {formatDate(invitation.createdAt)}
                          {invitation.invitedByFirstName && (
                            <span> von {invitation.invitedByFirstName} {invitation.invitedByLastName}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={invitation.status === 'pending' ? 'outline' : 'secondary'}
                          className={invitation.status === 'pending' ? 'text-orange-600' : ''}
                        >
                          {invitation.status === 'pending' ? 'Ausstehend' : invitation.status}
                        </Badge>
              </div>
            </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Keine ausstehenden Einladungen</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={loadAdminData} 
        variant="outline" 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Wird geladen..." : "Daten aktualisieren"}
      </Button>
    </div>
  );
}
