
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, Palette, Award, Users } from "lucide-react";

export function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Verwaltung der App-Einstellungen und Konfiguration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Corporate Design */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Corporate Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primary-color">Primärfarbe</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input 
                  id="primary-color" 
                  type="color" 
                  defaultValue="#f97316" 
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input defaultValue="#f97316" placeholder="#f97316" className="flex-1" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondary-color">Sekundärfarbe</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input 
                  id="secondary-color" 
                  type="color" 
                  defaultValue="#0f172a" 
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input defaultValue="#0f172a" placeholder="#0f172a" className="flex-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="app-name">App Name</Label>
              <Input id="app-name" defaultValue="SportifyScore" />
            </div>

            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Design speichern
            </Button>
          </CardContent>
        </Card>

        {/* Activity Scoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Aktivitäts-Wertung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pullup-points">Klimmzug (Punkte pro Stück)</Label>
              <Input id="pullup-points" type="number" defaultValue="10" />
            </div>
            
            <div>
              <Label htmlFor="pushup-points">Liegestütze (Punkte pro Stück)</Label>
              <Input id="pushup-points" type="number" defaultValue="2" />
            </div>
            
            <div>
              <Label htmlFor="running-points">Laufen (Punkte pro km)</Label>
              <Input id="running-points" type="number" defaultValue="15" />
            </div>
            
            <div>
              <Label htmlFor="cycling-points">Radfahren (Punkte pro km)</Label>
              <Input id="cycling-points" type="number" defaultValue="5" />
            </div>

            <Button className="w-full bg-blue-500 hover:bg-blue-600">
              Wertung speichern
            </Button>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              App Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Neue Registrierungen</p>
                <p className="text-sm text-gray-600">Erlaube neue Benutzer-Registrierungen</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Öffentliche Rangliste</p>
                <p className="text-sm text-gray-600">Zeige Rangliste für alle sichtbar</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Workout Verifizierung</p>
                <p className="text-sm text-gray-600">Erfordere Admin-Freigabe für Workouts</p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div>
              <Label htmlFor="max-daily-workouts">Max. Workouts pro Tag</Label>
              <Input id="max-daily-workouts" type="number" defaultValue="5" />
            </div>
          </CardContent>
        </Card>

        {/* User Invites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Benutzer Einladungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="invite-code">Einladungscode generieren</Label>
              <div className="flex gap-2 mt-1">
                <Input id="invite-code" value="SPORT2024" readOnly />
                <Button variant="outline">Neu generieren</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aktive Einladungscodes</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-mono">SPORT2024</span>
                    <Badge className="ml-2" variant="outline">5 verwendet</Badge>
                  </div>
                  <Button variant="destructive" size="sm">Deaktivieren</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-mono">FITNESS2024</span>
                    <Badge className="ml-2" variant="outline">12 verwendet</Badge>
                  </div>
                  <Button variant="destructive" size="sm">Deaktivieren</Button>
                </div>
              </div>
            </div>

            <Button className="w-full bg-green-500 hover:bg-green-600">
              Neuen Code erstellen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
