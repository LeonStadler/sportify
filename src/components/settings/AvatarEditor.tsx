import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shuffle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import NiceAvatar, { NiceAvatarProps, genConfig } from 'react-nice-avatar';

interface AvatarEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConfig?: NiceAvatarProps;
  onSave: (config: NiceAvatarProps) => void;
}

const defaultConfig: NiceAvatarProps = {
  sex: 'man',
  faceColor: '#F9C9B6',
  earSize: 'big',
  eyeStyle: 'circle',
  noseStyle: 'short',
  mouthStyle: 'smile',
  shirtStyle: 'polo',
  bgColor: '#F9C9B6',
  hairStyle: 'normal',
  hairColor: '#4A4A4A',
  hatStyle: 'none',
  glassesStyle: 'none',
  shirtColor: '#FC909F',
  isGradient: false,
};

export function AvatarEditor({ open, onOpenChange, currentConfig, onSave }: AvatarEditorProps) {
  const [config, setConfig] = useState<NiceAvatarProps>(currentConfig || defaultConfig);

  // Update config when currentConfig changes
  useEffect(() => {
    if (open && currentConfig) {
      // Merge currentConfig with defaults to ensure all properties are present
      setConfig({ ...defaultConfig, ...currentConfig });
    } else if (open && !currentConfig) {
      setConfig(defaultConfig);
    }
  }, [open, currentConfig]);

  // Handler to update a single config property without affecting others
  const updateConfig = useCallback(<K extends keyof NiceAvatarProps>(key: K, value: NiceAvatarProps[K]) => {
    setConfig(prev => {
      // Only update the specific property, keep everything else unchanged
      if (value === null || value === undefined || value === '') {
        const newConfig = { ...prev };
        delete newConfig[key];
        return newConfig;
      } else {
        return { ...prev, [key]: value };
      }
    });
  }, []);

  const handleRandomize = useCallback(() => {
    // Generate random config using genConfig()
    const randomConfig = genConfig();
    // Merge with current sex if user wants to keep it
    setConfig(prev => ({
      ...prev,
      ...randomConfig,
      // Optionally keep current sex
      // sex: prev.sex,
    }));
  }, []);

  const handleSave = () => {
    // Clean up config - remove undefined/null values and pass to onSave
    const cleanedConfig = { ...config };
    // Remove undefined/null/empty string values
    (Object.keys(cleanedConfig) as Array<keyof NiceAvatarProps>).forEach((key) => {
      const value = cleanedConfig[key];
      if (value === undefined || value === null || value === '') {
        delete cleanedConfig[key];
      }
    });
    onSave(cleanedConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avatar erstellen</DialogTitle>
          <DialogDescription>
            Passe deinen Avatar nach deinen Wünschen an
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <NiceAvatar
                style={{ width: '200px', height: '200px' }}
                {...config}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleRandomize}
              className="gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Zufällig generieren
            </Button>
          </div>

          {/* Configuration Options with Tabs */}
          <Tabs defaultValue="face" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="face">Gesicht</TabsTrigger>
              <TabsTrigger value="hair">Haare</TabsTrigger>
              <TabsTrigger value="accessories">Accessoires</TabsTrigger>
              <TabsTrigger value="other">Sonstiges</TabsTrigger>
            </TabsList>

            {/* Face Tab */}
            <TabsContent value="face" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Geschlecht</Label>
                  <Select
                    value={config.sex || 'man'}
                    onValueChange={(value) => updateConfig('sex', value as 'man' | 'woman')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="man">Mann</SelectItem>
                      <SelectItem value="woman">Frau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Gesichtsfarbe</Label>
                  <Select
                    value={config.faceColor || '#F9C9B6'}
                    onValueChange={(value) => updateConfig('faceColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#F9C9B6">Hell</SelectItem>
                      <SelectItem value="#AC6651">Dunkel</SelectItem>
                      <SelectItem value="#E5A68A">Mittel</SelectItem>
                      <SelectItem value="#FDBCB4">Rosa</SelectItem>
                      <SelectItem value="#F8D25C">Gelb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ohrgröße</Label>
                  <Select
                    value={config.earSize || 'big'}
                    onValueChange={(value) => updateConfig('earSize', value as 'big' | 'small')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="big">Groß</SelectItem>
                      <SelectItem value="small">Klein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Augenform</Label>
                  <Select
                    value={config.eyeStyle || 'circle'}
                    onValueChange={(value) => updateConfig('eyeStyle', value as 'circle' | 'oval' | 'smile')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Rund</SelectItem>
                      <SelectItem value="oval">Oval</SelectItem>
                      <SelectItem value="smile">Lächeln</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nasenform</Label>
                  <Select
                    value={config.noseStyle || 'short'}
                    onValueChange={(value) => updateConfig('noseStyle', value as 'short' | 'long' | 'round')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Kurz</SelectItem>
                      <SelectItem value="long">Lang</SelectItem>
                      <SelectItem value="round">Rund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mundform</Label>
                  <Select
                    value={config.mouthStyle || 'smile'}
                    onValueChange={(value) => updateConfig('mouthStyle', value as 'laugh' | 'smile' | 'peace')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laugh">Lachen</SelectItem>
                      <SelectItem value="smile">Lächeln</SelectItem>
                      <SelectItem value="peace">Peace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Hair Tab */}
            <TabsContent value="hair" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Haarstil</Label>
                  <Select
                    value={config.hairStyle || 'normal'}
                    onValueChange={(value) => updateConfig('hairStyle', value as 'normal' | 'thick' | 'mohawk' | 'womanLong' | 'womanShort')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="thick">Dick</SelectItem>
                      <SelectItem value="mohawk">Mohawk</SelectItem>
                      {config.sex === 'woman' && (
                        <>
                          <SelectItem value="womanLong">Lang (Frau)</SelectItem>
                          <SelectItem value="womanShort">Kurz (Frau)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Haarfarbe</Label>
                  <Select
                    value={config.hairColor || '#4A4A4A'}
                    onValueChange={(value) => updateConfig('hairColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#4A4A4A">Schwarz</SelectItem>
                      <SelectItem value="#8B4513">Braun</SelectItem>
                      <SelectItem value="#D4A574">Blond</SelectItem>
                      <SelectItem value="#DC143C">Rot</SelectItem>
                      <SelectItem value="#FFD700">Gold</SelectItem>
                      <SelectItem value="#708090">Grau</SelectItem>
                      <SelectItem value="#FFFFFF">Weiß</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Accessories Tab */}
            <TabsContent value="accessories" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hut</Label>
                  <Select
                    value={config.hatStyle || 'none'}
                    onValueChange={(value) => updateConfig('hatStyle', value as 'none' | 'beanie' | 'turban')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Kein Hut</SelectItem>
                      <SelectItem value="beanie">Mütze</SelectItem>
                      <SelectItem value="turban">Turban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.hatStyle !== 'none' && (
                  <div className="space-y-2">
                    <Label>Hutfarbe</Label>
                    <Select
                      value={config.hatColor || '#000000'}
                      onValueChange={(value) => updateConfig('hatColor', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#000000">Schwarz</SelectItem>
                        <SelectItem value="#FFFFFF">Weiß</SelectItem>
                        <SelectItem value="#FF0000">Rot</SelectItem>
                        <SelectItem value="#0000FF">Blau</SelectItem>
                        <SelectItem value="#008000">Grün</SelectItem>
                        <SelectItem value="#FFA500">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Brille</Label>
                  <Select
                    value={config.glassesStyle || 'none'}
                    onValueChange={(value) => updateConfig('glassesStyle', value as 'none' | 'round' | 'square')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine Brille</SelectItem>
                      <SelectItem value="round">Rund</SelectItem>
                      <SelectItem value="square">Eckig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Other Tab */}
            <TabsContent value="other" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kleidung</Label>
                  <Select
                    value={config.shirtStyle || 'polo'}
                    onValueChange={(value) => updateConfig('shirtStyle', value as 'polo' | 'short' | 'hoody')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="polo">Polo</SelectItem>
                      <SelectItem value="short">T-Shirt</SelectItem>
                      <SelectItem value="hoody">Kapuze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kleidungsfarbe</Label>
                  <Select
                    value={config.shirtColor || '#FC909F'}
                    onValueChange={(value) => updateConfig('shirtColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#FC909F">Rosa</SelectItem>
                      <SelectItem value="#73D1EF">Blau</SelectItem>
                      <SelectItem value="#50C878">Grün</SelectItem>
                      <SelectItem value="#FF6B6B">Rot</SelectItem>
                      <SelectItem value="#FFD93D">Gelb</SelectItem>
                      <SelectItem value="#6BCB77">Lichtgrün</SelectItem>
                      <SelectItem value="#000000">Schwarz</SelectItem>
                      <SelectItem value="#FFFFFF">Weiß</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hintergrundfarbe</Label>
                  <Select
                    value={config.bgColor || '#F9C9B6'}
                    onValueChange={(value) => updateConfig('bgColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#F9C9B6">Beige</SelectItem>
                      <SelectItem value="#AC6651">Braun</SelectItem>
                      <SelectItem value="#D08B5B">Orange</SelectItem>
                      <SelectItem value="#F4D150">Gelb</SelectItem>
                      <SelectItem value="#ED9C6E">Pfirsich</SelectItem>
                      <SelectItem value="#6C9BD1">Blau</SelectItem>
                      <SelectItem value="#A8D5BA">Grün</SelectItem>
                      <SelectItem value="#E8B4D1">Rosa</SelectItem>
                      <SelectItem value="#FFFFFF">Weiß</SelectItem>
                      <SelectItem value="#000000">Schwarz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

