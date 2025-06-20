
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Shield, Settings, Award, Share2 } from "lucide-react";

export function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-600 mt-2">Verwalte deine persönlichen Einstellungen und Ziele</p>
      </div>

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
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-orange-500 text-white text-2xl font-bold">
                        DU
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="sm" 
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600"
                    >
                      <Camera size={14} />
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Dein Name</h3>
                    <p className="text-gray-600">Rang #5 von 127 Athleten</p>
                    <Badge className="mt-1 bg-orange-100 text-orange-800">1,980 Punkte</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Dein Name" />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-Mail</Label>
                    <Input id="email" type="email" defaultValue="dein@email.de" />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Standort</Label>
                    <Input id="location" defaultValue="Deutschland" />
                  </div>
                </div>
                
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Profil aktualisieren
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Wochenziele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pullup-goal">Klimmzüge pro Woche</Label>
                  <Input id="pullup-goal" type="number" defaultValue="100" />
                </div>
                
                <div>
                  <Label htmlFor="pushup-goal">Liegestütze pro Woche</Label>
                  <Input id="pushup-goal" type="number" defaultValue="400" />
                </div>
                
                <div>
                  <Label htmlFor="running-goal">Laufen (km pro Woche)</Label>
                  <Input id="running-goal" type="number" defaultValue="25" />
                </div>
                
                <div>
                  <Label htmlFor="cycling-goal">Radfahren (km pro Woche)</Label>
                  <Input id="cycling-goal" type="number" defaultValue="100" />
                </div>
                
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Ziele speichern
                </Button>
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
                <p className="text-sm text-gray-600">
                  Lade deine Freunde ein und erhalte Bonuspunkte für jeden neuen Nutzer!
                </p>
                
                <div>
                  <Label htmlFor="invite-link">Dein Einladungslink</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      id="invite-link" 
                      value="https://sportifyscore.app/invite/abc123" 
                      readOnly 
                    />
                    <Button variant="outline">Kopieren</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full">WhatsApp</Button>
                  <Button variant="outline" className="w-full">E-Mail</Button>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Einladungsbonus</p>
                  <p className="text-sm text-green-600">50 Punkte für jeden neuen Nutzer</p>
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
                <div>
                  <Label htmlFor="current-password">Aktuelles Passwort</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div>
                  <Label htmlFor="new-password">Neues Passwort</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                
                <Button className="w-full bg-red-500 hover:bg-red-600">
                  Passwort ändern
                </Button>
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
                    <p className="text-sm text-gray-600">Zusätzliche Sicherheit für dein Konto</p>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <p className="text-sm font-medium">Backup-Codes</p>
                  <p className="text-sm text-gray-600">
                    Speichere diese Codes sicher. Du kannst sie verwenden, wenn du keinen Zugang zu deinem Authenticator hast.
                  </p>
                  <Button variant="outline" className="w-full">
                    Backup-Codes generieren
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Login History */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Anmelde-Verlauf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "Heute, 14:30", device: "Chrome auf Windows", location: "Deutschland", current: true },
                    { date: "Gestern, 09:15", device: "Safari auf iPhone", location: "Deutschland", current: false },
                    { date: "3 Tage her, 18:45", device: "Chrome auf Windows", location: "Deutschland", current: false },
                  ].map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{login.device}</p>
                        <p className="text-sm text-gray-600">{login.date} • {login.location}</p>
                      </div>
                      {login.current ? (
                        <Badge className="bg-green-100 text-green-800">Aktuelle Sitzung</Badge>
                      ) : (
                        <Button variant="outline" size="sm">Abmelden</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Units & Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Einheiten & Maßstäbe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="distance-unit">Streckeneinheit</Label>
                  <Select defaultValue="km">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kilometer</SelectItem>
                      <SelectItem value="miles">Meilen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="weight-unit">Gewichtseinheit</Label>
                  <Select defaultValue="kg">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogramm</SelectItem>
                      <SelectItem value="lbs">Pfund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="time-format">Zeitformat</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Stunden</SelectItem>
                      <SelectItem value="12h">12 Stunden (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Benachrichtigungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Workout Erinnerungen</p>
                    <p className="text-sm text-gray-600">Täglich um 18:00 Uhr</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Wöchentliche Zusammenfassung</p>
                    <p className="text-sm text-gray-600">Jeden Sonntag</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ranglistenänderungen</p>
                    <p className="text-sm text-gray-600">Bei Auf- oder Abstieg</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Neue persönliche Rekorde</p>
                    <p className="text-sm text-gray-600">Sofortige Benachrichtigung</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Erfolge & Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "First Timer", desc: "Erstes Workout eingetragen", icon: "🏆", achieved: true, date: "15.03.2024" },
                  { name: "Pull-up Hero", desc: "50 Klimmzüge in einer Woche", icon: "💪", achieved: true, date: "22.03.2024" },
                  { name: "Runner", desc: "20km in einer Woche gelaufen", icon: "🏃", achieved: true, date: "29.03.2024" },
                  { name: "Streak Master", desc: "7 Tage in Folge trainiert", icon: "🔥", achieved: false, progress: "4/7" },
                  { name: "Century Club", desc: "100 Liegestütze an einem Tag", icon: "💯", achieved: false, progress: "67/100" },
                  { name: "Distance King", desc: "100km Radfahren in einer Woche", icon: "🚴", achieved: false, progress: "78/100" },
                ].map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.achieved 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{achievement.desc}</p>
                      {achievement.achieved ? (
                        <Badge className="mt-2 bg-orange-100 text-orange-800">
                          Erreicht am {achievement.date}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-2">
                          {achievement.progress}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
