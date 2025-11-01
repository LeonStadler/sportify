import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NiceAvatar, { NiceAvatarProps } from 'react-nice-avatar';
import { useState, useEffect } from 'react';

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
};

export function AvatarEditor({ open, onOpenChange, currentConfig, onSave }: AvatarEditorProps) {
  const [config, setConfig] = useState<NiceAvatarProps>(currentConfig || defaultConfig);

  // Update config when currentConfig changes
  useEffect(() => {
    if (open && currentConfig) {
      setConfig(currentConfig);
    } else if (open && !currentConfig) {
      setConfig(defaultConfig);
    }
  }, [open, currentConfig]);

  const handleSave = () => {
    onSave(config);
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
          <div className="flex justify-center">
            <div className="relative">
              <NiceAvatar 
                style={{ width: '200px', height: '200px' }} 
                {...config} 
              />
            </div>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Geschlecht</Label>
              <Select
                value={config.sex || 'man'}
                onValueChange={(value) => setConfig(prev => ({ ...prev, sex: value as 'man' | 'woman' }))}
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
                value={config.faceColor}
                onValueChange={(value) => setConfig(prev => ({ ...prev, faceColor: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#F9C9B6">Hell</SelectItem>
                  <SelectItem value="#AC6651">Dunkel</SelectItem>
                  <SelectItem value="#E5A68A">Mittel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ohrgröße</Label>
              <Select
                value={config.earSize || 'big'}
                onValueChange={(value) => setConfig(prev => ({ ...prev, earSize: value as 'big' | 'small' }))}
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
                onValueChange={(value) => setConfig(prev => ({ ...prev, eyeStyle: value as 'circle' | 'oval' | 'smile' }))}
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
                onValueChange={(value) => setConfig(prev => ({ ...prev, noseStyle: value as 'short' | 'long' | 'round' }))}
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
                onValueChange={(value) => setConfig(prev => ({ ...prev, mouthStyle: value as 'laugh' | 'smile' | 'peace' }))}
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

            <div className="space-y-2">
              <Label>Kleidung</Label>
              <Select
                value={config.shirtStyle || 'polo'}
                onValueChange={(value) => setConfig(prev => ({ ...prev, shirtStyle: value as 'polo' | 'short' | 'hoody' }))}
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
              <Label>Hintergrundfarbe</Label>
              <Select
                value={config.bgColor}
                onValueChange={(value) => setConfig(prev => ({ ...prev, bgColor: value }))}
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
                </SelectContent>
              </Select>
            </div>
          </div>
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

