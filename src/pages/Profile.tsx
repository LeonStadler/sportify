import { PageTemplate } from "@/components/PageTemplate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Invitation, useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Award, Check, Copy, Mail, Share2, Shield } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NiceAvatar from 'react-nice-avatar';

export function Profile() {
  const { t } = useTranslation();
  const { user, updateProfile, deleteAccount, enable2FA, disable2FA, isLoading, inviteFriend, getInvitations, getDisplayName } = useAuth();
  const { toast } = useToast();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    nickname: user?.nickname || '',
    displayPreference: user?.displayPreference || 'firstName'
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  // User preferences state
  const [preferencesForm, setPreferencesForm] = useState({
    languagePreference: user?.languagePreference || 'de',
    timeFormat: user?.preferences?.timeFormat || '24h',
    useNiceAvatar: user?.preferences?.useNiceAvatar ?? false,
    units: {
      distance: user?.preferences?.units?.distance || 'km',
      weight: user?.preferences?.units?.weight || 'kg',
      temperature: user?.preferences?.units?.temperature || 'celsius'
    },
    notifications: {
      push: user?.preferences?.notifications?.push ?? true,
      email: user?.preferences?.notifications?.email ?? true
    },
    privacy: {
      publicProfile: user?.preferences?.privacy?.publicProfile ?? true
    },
    theme: user?.preferences?.theme || 'system'
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // User invitation state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.has2FA || false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Load invitations on mount
  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        nickname: user.nickname || '',
        displayPreference: user.displayPreference || 'firstName'
      });
      setPreferencesForm({
        languagePreference: user.languagePreference || 'de',
        timeFormat: user.preferences?.timeFormat || '24h',
        useNiceAvatar: user.preferences?.useNiceAvatar ?? false,
        units: {
          distance: user.preferences?.units?.distance || 'km',
          weight: user.preferences?.units?.weight || 'kg',
          temperature: user.preferences?.units?.temperature || 'celsius'
        },
        notifications: {
          push: user.preferences?.notifications?.push ?? true,
          email: user.preferences?.notifications?.email ?? true
        },
        privacy: {
          publicProfile: user.preferences?.privacy?.publicProfile ?? true
        },
        theme: user.preferences?.theme || 'system'
      });
      setTwoFAEnabled(user.has2FA || false);
    }
  }, [user]);

  const loadInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const data = await getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarConfig = () => {
    if (!user) return {};
    // Generate consistent avatar based on user ID
    const seed = user.id || user.email || 'default';
    return {
      sex: (['man', 'woman'] as const)[Math.abs(seed.charCodeAt(0)) % 2],
      faceColor: ['#F9C9B6', '#AC6651'][Math.abs(seed.charCodeAt(0)) % 2] as string,
      earSize: 'big' as const,
      eyeStyle: (['circle', 'oval', 'smile'] as const)[Math.abs(seed.charCodeAt(1)) % 3],
      noseStyle: (['short', 'long', 'round'] as const)[Math.abs(seed.charCodeAt(2)) % 3],
      mouthStyle: (['laugh', 'smile', 'peace'] as const)[Math.abs(seed.charCodeAt(3)) % 3],
      shirtStyle: (['polo', 'short', 'hoody'] as const)[Math.abs(seed.charCodeAt(4)) % 3],
      bgColor: (['#F9C9B6', '#AC6651', '#D08B5B', '#F4D150', '#ED9C6E'] as const)[Math.abs(seed.charCodeAt(5)) % 5],
    };
  };

  const validateProfileForm = (): boolean => {
    const errors: { firstName?: string; lastName?: string } = {};

    if (!profileForm.firstName || profileForm.firstName.trim() === '') {
      errors.firstName = 'Vorname ist ein Pflichtfeld.';
    }

    if (!profileForm.lastName || profileForm.lastName.trim() === '') {
      errors.lastName = 'Nachname ist ein Pflichtfeld.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      toast({
        title: "Validierungsfehler",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    // Check if displayPreference is 'nickname' but no nickname is provided
    if (profileForm.displayPreference === 'nickname' && (!profileForm.nickname || profileForm.nickname.trim() === '')) {
      toast({
        title: "Fehler",
        description: "Wenn 'Spitzname' als Anzeigename gewählt ist, muss ein Spitzname angegeben werden.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProfile(profileForm);
      setValidationErrors({});
      toast({
        title: "Profil aktualisiert",
        description: "Deine Profilinformationen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Speichern des Profils",
        variant: "destructive",
      });
    }
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile({
        languagePreference: preferencesForm.languagePreference as 'de' | 'en',
        preferences: preferencesForm
      });
      toast({
        title: "Einstellungen gespeichert",
        description: "Deine Präferenzen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Speichern der Einstellungen",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die Passwörter stimmen nicht überein.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Fehler",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    // This would need a separate API endpoint for password change
    toast({
      title: "Funktion in Entwicklung",
      description: "Passwort ändern wird bald verfügbar sein.",
    });
  };

  const handleToggle2FA = async () => {
    try {
      if (twoFAEnabled) {
        // Show password prompt for disabling 2FA
        const password = prompt("Bitte gib dein Passwort ein, um 2FA zu deaktivieren:");
        if (!password) return;

        await disable2FA(password);
        setTwoFAEnabled(false);
        toast({
          title: "2FA deaktiviert",
          description: "Zwei-Faktor-Authentifizierung wurde erfolgreich deaktiviert.",
        });
      } else {
        const result = await enable2FA();
        setTwoFAEnabled(true);
        toast({
          title: "2FA aktiviert",
          description: "Zwei-Faktor-Authentifizierung wurde erfolgreich aktiviert.",
        });
        // In a real app, you would show the QR code and backup codes
        console.log('2FA Data:', result);
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler bei 2FA-Einstellung",
        variant: "destructive",
      });
    }
  };

  const handleInviteFriend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteFriend(inviteForm.email, inviteForm.firstName, inviteForm.lastName);
      toast({
        title: "Einladung gesendet",
        description: `Einladung wurde an ${inviteForm.email} gesendet.`,
      });
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

  const copyInviteLink = async () => {
    const inviteLink = `https://sportify.app/invite/${user?.id}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: "Link kopiert",
        description: "Einladungslink wurde in die Zwischenablage kopiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Link konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.");
    if (!confirmDelete) return;

    const password = prompt("Bitte gib dein Passwort ein, um das Konto zu löschen:");
    if (!password) return;

    try {
      await deleteAccount(password);
      toast({
        title: "Konto gelöscht",
        description: "Dein Konto wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Löschen des Kontos",
        variant: "destructive",
      });
    }
  };

  const getInvitationStatusBadge = (invitation: Invitation) => {
    if (invitation.used) {
      return <Badge variant="default" className="bg-green-500">Angenommen</Badge>;
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return <Badge variant="secondary">Abgelaufen</Badge>;
    }
    return <Badge variant="outline">Ausstehend</Badge>;
  };

  if (!user) {
    return <div>Lädt...</div>;
  }

  return (
    <PageTemplate
      title={t('profile.title', 'Profil')}
      subtitle={t('profile.subtitle', 'Verwalte deine persönlichen Einstellungen und Ziele')}
      className="space-y-6"
    >
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sicherheit</TabsTrigger>
          <TabsTrigger value="preferences">Einstellungen</TabsTrigger>
          <TabsTrigger value="achievements">Erfolge</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profil Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      {user.preferences?.useNiceAvatar ? (
                        <NiceAvatar style={{ width: '80px', height: '80px' }} {...getAvatarConfig()} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                          {getUserInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{getDisplayName()}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    {user.isAdmin && (
                      <Badge variant="secondary" className="mt-1">
                        <Shield size={12} className="mr-1" />
                        Administrator
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <form onSubmit={handleProfileUpdate} className="space-y-3">
                  <div>
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => {
                        setProfileForm(prev => ({ ...prev, firstName: e.target.value }));
                        if (validationErrors.firstName) {
                          setValidationErrors(prev => ({ ...prev, firstName: undefined }));
                        }
                      }}
                      className={validationErrors.firstName ? 'border-destructive' : ''}
                    />
                    {validationErrors.firstName && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => {
                        setProfileForm(prev => ({ ...prev, lastName: e.target.value }));
                        if (validationErrors.lastName) {
                          setValidationErrors(prev => ({ ...prev, lastName: undefined }));
                        }
                      }}
                      className={validationErrors.lastName ? 'border-destructive' : ''}
                    />
                    {validationErrors.lastName && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nickname">Spitzname (optional)</Label>
                    <Input
                      id="nickname"
                      value={profileForm.nickname}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, nickname: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="displayPreference">Anzeigename</Label>
                    <Select
                      value={profileForm.displayPreference}
                      onValueChange={(value) => setProfileForm(prev => ({ ...prev, displayPreference: value as 'nickname' | 'firstName' | 'fullName' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="firstName">Vorname</SelectItem>
                        <SelectItem value="fullName">Vollständiger Name</SelectItem>
                        <SelectItem value="nickname" disabled={!profileForm.nickname || profileForm.nickname.trim() === ''}>
                          Spitzname {(!profileForm.nickname || profileForm.nickname.trim() === '') && '(kein Spitzname vergeben)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {profileForm.displayPreference === 'nickname' && (!profileForm.nickname || profileForm.nickname.trim() === '') && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Bitte gib einen Spitzname ein, um diese Option zu verwenden.
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Wird gespeichert..." : "Profil aktualisieren"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Invite Friends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Freunde einladen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Lade deine Freunde ein und trainiert gemeinsam!
                </p>

                <form onSubmit={handleInviteFriend} className="space-y-3">
                  <div>
                    <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="freund@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="invite-firstName">Vorname</Label>
                    <Input
                      id="invite-firstName"
                      value={inviteForm.firstName}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Max"
                    />
                  </div>

                  <div>
                    <Label htmlFor="invite-lastName">Nachname</Label>
                    <Input
                      id="invite-lastName"
                      value={inviteForm.lastName}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Mustermann"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Wird gesendet..." : "Einladung senden"}
                  </Button>
                </form>

                <Separator />

                <div>
                  <Label htmlFor="invite-link">Dein Einladungslink</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="invite-link"
                      value={`https://sportify.app/invite/${user.id}`}
                      readOnly
                    />
                    <Button variant="outline" onClick={copyInviteLink}>
                      {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Invitations List */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Eingeladene Freunde</h4>
                  {loadingInvitations ? (
                    <p className="text-sm text-muted-foreground">Lädt...</p>
                  ) : invitations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Noch keine Einladungen gesendet.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {invitation.firstName} {invitation.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {invitation.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(invitation.createdAt).toLocaleDateString('de-DE')}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-2">
                            {getInvitationStatusBadge(invitation)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-accent p-3 rounded-lg">
                  <p className="text-sm font-medium">E-Mail Verifizierung</p>
                  <p className="text-sm text-muted-foreground">
                    {user.isEmailVerified
                      ? "✓ Deine E-Mail ist verifiziert"
                      : "⚠ Bitte verifiziere deine E-Mail-Adresse"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Passwort ändern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Aktuelles Passwort</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">Neues Passwort</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" className="w-full" variant="destructive" disabled={isLoading}>
                    Passwort ändern
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle>Zwei-Faktor-Authentifizierung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA aktivieren</p>
                    <p className="text-sm text-muted-foreground">
                      Zusätzliche Sicherheit für dein Konto
                    </p>
                    <p className="text-sm">
                      Status: {user.has2FA ? "✓ Aktiviert" : "○ Deaktiviert"}
                    </p>
                  </div>
                  <Switch
                    checked={twoFAEnabled}
                    onCheckedChange={handleToggle2FA}
                    disabled={isLoading}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="font-medium text-sm">Kontosicherheit</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Erstellt: {new Date(user.createdAt).toLocaleDateString('de-DE')}</p>
                    <p>• Letzter Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('de-DE') : 'Nie'}</p>
                    <p>• E-Mail verifiziert: {user.isEmailVerified ? 'Ja' : 'Nein'}</p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  Konto löschen
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <form onSubmit={handlePreferencesUpdate}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Benutzereinstellungen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benutzereinstellungen</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Passe die App an deine Vorlieben an
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sprache */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sprache</Label>
                    <Select
                      value={preferencesForm.languagePreference}
                      onValueChange={(value) => setPreferencesForm(prev => ({ ...prev, languagePreference: value as 'de' | 'en' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Uhrzeitformat */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Uhrzeitformat</Label>
                    <Select
                      value={preferencesForm.timeFormat}
                      onValueChange={(value) => setPreferencesForm(prev => ({ ...prev, timeFormat: value as '12h' | '24h' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24-Stunden (14:30)</SelectItem>
                        <SelectItem value="12h">12-Stunden (2:30 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Theme */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Design</Label>
                    <Select
                      value={preferencesForm.theme}
                      onValueChange={(value) => setPreferencesForm(prev => ({ ...prev, theme: value as 'light' | 'dark' | 'system' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="light">Hell</SelectItem>
                        <SelectItem value="dark">Dunkel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Avatar Style */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Avatar-Stil</Label>
                      <p className="text-xs text-muted-foreground">
                        Verwende einen generierten Avatar statt Initialen
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.useNiceAvatar}
                      onCheckedChange={(checked) => setPreferencesForm(prev => ({ ...prev, useNiceAvatar: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Einheiten-Präferenzen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Einheiten-Präferenzen</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Wähle deine bevorzugten Einheiten für Messungen
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Distanz */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Distanz</Label>
                    <Select
                      value={preferencesForm.units.distance}
                      onValueChange={(value) => setPreferencesForm(prev => ({
                        ...prev,
                        units: { ...prev.units, distance: value as 'km' | 'm' | 'miles' | 'yards' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">Kilometer (km)</SelectItem>
                        <SelectItem value="m">Meter (m)</SelectItem>
                        <SelectItem value="miles">Meilen</SelectItem>
                        <SelectItem value="yards">Yards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gewicht */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gewicht</Label>
                    <Select
                      value={preferencesForm.units.weight}
                      onValueChange={(value) => setPreferencesForm(prev => ({
                        ...prev,
                        units: { ...prev.units, weight: value as 'kg' | 'lbs' | 'stone' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogramm (kg)</SelectItem>
                        <SelectItem value="lbs">Pfund (lbs)</SelectItem>
                        <SelectItem value="stone">Stone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Temperatur */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Temperatur</Label>
                    <Select
                      value={preferencesForm.units.temperature}
                      onValueChange={(value) => setPreferencesForm(prev => ({
                        ...prev,
                        units: { ...prev.units, temperature: value as 'celsius' | 'fahrenheit' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">Celsius (°C)</SelectItem>
                        <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* App-Einstellungen */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">App-Einstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Push-Benachrichtigungen</Label>
                      <p className="text-xs text-muted-foreground">
                        Erhalte Benachrichtigungen für neue Aktivitäten und Freundschaftsanfragen
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.notifications.push}
                      onCheckedChange={(checked) => setPreferencesForm(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">E-Mail-Benachrichtigungen</Label>
                      <p className="text-xs text-muted-foreground">
                        Wöchentliche Zusammenfassung deiner Fortschritte
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.notifications.email}
                      onCheckedChange={(checked) => setPreferencesForm(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Öffentliches Profil</Label>
                      <p className="text-xs text-muted-foreground">
                        Andere Benutzer können dein Profil und deine Aktivitäten sehen
                      </p>
                    </div>
                    <Switch
                      checked={preferencesForm.privacy.publicProfile}
                      onCheckedChange={(checked) => setPreferencesForm(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, publicProfile: checked }
                      }))}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Wird gespeichert..." : "Alle Einstellungen speichern"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Erfolge & Statistiken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Erfolge und detaillierte Statistiken werden bald verfügbar sein.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
