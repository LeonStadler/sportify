import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shuffle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
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

const HAIR_COLORS = [
  "#4A4A4A",
  "#8B4513",
  "#D4A574",
  "#DC143C",
  "#FFD700",
  "#708090",
  "#FFFFFF",
];

const HAT_COLORS = ["#000000", "#FFFFFF", "#FF0000", "#0000FF", "#008000", "#FFA500"];

const SHIRT_COLORS = [
  "#FC909F",
  "#73D1EF",
  "#50C878",
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#000000",
  "#FFFFFF",
];

const BG_COLORS = [
  "#F9C9B6",
  "#AC6651",
  "#D08B5B",
  "#F4D150",
  "#ED9C6E",
  "#6C9BD1",
  "#A8D5BA",
  "#E8B4D1",
  "#FFFFFF",
  "#000000",
];

const GRADIENT_BG_COLORS = [
  "linear-gradient(45deg, #178bff 0%, #ff6868 100%)",
  "linear-gradient(45deg, #176fff 0%, #68ffef 100%)",
  "linear-gradient(45deg, #ff1717 0%, #ffd368 100%)",
  "linear-gradient(90deg, #36cd1c 0%, #68deff 100%)",
  "linear-gradient(45deg, #3e1ccd 0%, #ff6871 100%)",
  "linear-gradient(45deg, #1729ff 0%, #ff56f7 100%)",
  "linear-gradient(45deg, #56b5f0 0%, #45ccb5 100%)",
];

const HAIR_STYLES_MAN = ["normal", "thick", "mohawk"] as const;
const HAIR_STYLES_WOMAN = ["normal", "womanLong", "womanShort"] as const;
const HAT_STYLES = ["none", "beanie", "turban"] as const;

const pickRandom = (values: string[]) =>
  values[Math.floor(Math.random() * values.length)];

export function AvatarEditor({ open, onOpenChange, currentConfig, onSave }: AvatarEditorProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<NiceAvatarProps>(currentConfig || defaultConfig);

  const normalizeConfig = useCallback((next: NiceAvatarProps) => {
    const normalized: NiceAvatarProps = { ...defaultConfig, ...next };
    const hairStyle = normalized.hairStyle;
    if (normalized.sex === "woman") {
      if (!HAIR_STYLES_WOMAN.includes((hairStyle || "") as (typeof HAIR_STYLES_WOMAN)[number])) {
        normalized.hairStyle = "womanLong";
      }
    } else {
      if (!HAIR_STYLES_MAN.includes((hairStyle || "") as (typeof HAIR_STYLES_MAN)[number])) {
        normalized.hairStyle = "normal";
      }
    }
    if (!HAIR_COLORS.includes(normalized.hairColor || "")) {
      normalized.hairColor = defaultConfig.hairColor;
    }
    if (!HAT_STYLES.includes((normalized.hatStyle || "none") as (typeof HAT_STYLES)[number])) {
      normalized.hatStyle = "none";
    }
    if (normalized.hatStyle === "none") {
      delete normalized.hatColor;
    } else if (!HAT_COLORS.includes(normalized.hatColor || "")) {
      normalized.hatColor = defaultConfig.hatColor || HAT_COLORS[0];
    }
    if (!SHIRT_COLORS.includes(normalized.shirtColor || "")) {
      normalized.shirtColor = defaultConfig.shirtColor;
    }
    if (normalized.isGradient) {
      if (!GRADIENT_BG_COLORS.includes(normalized.bgColor || "")) {
        normalized.bgColor = GRADIENT_BG_COLORS[0];
      }
    } else {
      if (typeof normalized.bgColor === "string" && normalized.bgColor.startsWith("linear-gradient")) {
        normalized.bgColor = defaultConfig.bgColor;
      }
      if (!BG_COLORS.includes(normalized.bgColor || "")) {
        normalized.bgColor = defaultConfig.bgColor;
      }
    }
    return normalized;
  }, []);

  const normalizeRandomConfig = useCallback(
    (next: NiceAvatarProps) => {
      const normalized = normalizeConfig(next);
      if (normalized.hairStyle === "mohawk") {
        normalized.hairStyle = "thick";
      }
      return normalized;
    },
    [normalizeConfig]
  );

  // Update config when currentConfig changes
  useEffect(() => {
    if (open && currentConfig) {
      // Merge currentConfig with defaults to ensure all properties are present
      setConfig(normalizeConfig(currentConfig));
    } else if (open && !currentConfig) {
      setConfig(defaultConfig);
    }
  }, [open, currentConfig, normalizeConfig]);

  // Handler to update a single config property without affecting others
  const updateConfig = useCallback(<K extends keyof NiceAvatarProps>(key: K, value: NiceAvatarProps[K]) => {
    setConfig(prev => {
      if (value === null || value === undefined || value === '') {
        const newConfig = { ...prev };
        delete newConfig[key];
        return newConfig;
      }
      const next = { ...prev, [key]: value };
      if (key === "sex") {
        const shouldPreserveHat = prev.hatStyle && prev.hatStyle !== "none";
        const nextConfig = normalizeConfig({
          ...next,
          hatColor: shouldPreserveHat ? prev.hatColor : next.hatColor,
        });
        return nextConfig;
      }
      if (key === "isGradient") {
        const nextConfig = normalizeConfig({
          ...next,
          isGradient: Boolean(value),
        });
        return nextConfig;
      }
      if (key === "hatStyle" && value === "none") {
        delete next.hatColor;
      }
      return next;
    });
  }, [normalizeConfig]);

  const handleRandomize = useCallback(() => {
    // Generate random config using genConfig()
    const randomConfig = genConfig({ sex: config.sex });
    const useGradient = Boolean(config.isGradient);
    setConfig(
      normalizeRandomConfig({
        ...randomConfig,
        sex: config.sex,
        isGradient: useGradient,
        hairColor: pickRandom(HAIR_COLORS),
        hatColor: pickRandom(HAT_COLORS),
        shirtColor: pickRandom(SHIRT_COLORS),
        bgColor: useGradient
          ? pickRandom(GRADIENT_BG_COLORS)
          : pickRandom(BG_COLORS),
      })
    );
  }, [config.isGradient, config.sex, normalizeRandomConfig]);

  const handleSave = () => {
    // Clean up config - remove undefined/null values and pass to onSave
    const cleanedConfig = { ...normalizeConfig(config) };
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col max-h-[90vh]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{t("profile.avatarEditor.title")}</DialogTitle>
            <DialogDescription>
              {t("profile.avatarEditor.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <div className="space-y-6">
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
                  {t("profile.avatarEditor.randomize")}
                </Button>
              </div>

              {/* Configuration Options with Tabs */}
              <Tabs defaultValue="face" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="face">
                    {t("profile.avatarEditor.tabs.face")}
                  </TabsTrigger>
                  <TabsTrigger value="hair">
                    {t("profile.avatarEditor.tabs.hair")}
                  </TabsTrigger>
                  <TabsTrigger value="accessories">
                    {t("profile.avatarEditor.tabs.accessories")}
                  </TabsTrigger>
                  <TabsTrigger value="other">
                    {t("profile.avatarEditor.tabs.other")}
                  </TabsTrigger>
                </TabsList>

            {/* Face Tab */}
            <TabsContent value="face" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.gender")}</Label>
                  <Select
                    value={config.sex || 'man'}
                    onValueChange={(value) => updateConfig('sex', value as 'man' | 'woman')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="man">
                        {t("profile.avatarEditor.options.gender.man")}
                      </SelectItem>
                      <SelectItem value="woman">
                        {t("profile.avatarEditor.options.gender.woman")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.faceColor")}</Label>
                  <Select
                    value={config.faceColor || '#F9C9B6'}
                    onValueChange={(value) => updateConfig('faceColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#F9C9B6">
                        {t("profile.avatarEditor.options.faceColor.light")}
                      </SelectItem>
                      <SelectItem value="#AC6651">
                        {t("profile.avatarEditor.options.faceColor.dark")}
                      </SelectItem>
                      <SelectItem value="#E5A68A">
                        {t("profile.avatarEditor.options.faceColor.medium")}
                      </SelectItem>
                      <SelectItem value="#FDBCB4">
                        {t("profile.avatarEditor.options.faceColor.pink")}
                      </SelectItem>
                      <SelectItem value="#F8D25C">
                        {t("profile.avatarEditor.options.faceColor.yellow")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.earSize")}</Label>
                  <Select
                    value={config.earSize || 'big'}
                    onValueChange={(value) => updateConfig('earSize', value as 'big' | 'small')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="big">
                        {t("profile.avatarEditor.options.earSize.big")}
                      </SelectItem>
                      <SelectItem value="small">
                        {t("profile.avatarEditor.options.earSize.small")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.eyeStyle")}</Label>
                  <Select
                    value={config.eyeStyle || 'circle'}
                    onValueChange={(value) => updateConfig('eyeStyle', value as 'circle' | 'oval' | 'smile')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">
                        {t("profile.avatarEditor.options.eyeStyle.circle")}
                      </SelectItem>
                      <SelectItem value="oval">
                        {t("profile.avatarEditor.options.eyeStyle.oval")}
                      </SelectItem>
                      <SelectItem value="smile">
                        {t("profile.avatarEditor.options.eyeStyle.smile")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.noseStyle")}</Label>
                  <Select
                    value={config.noseStyle || 'short'}
                    onValueChange={(value) => updateConfig('noseStyle', value as 'short' | 'long' | 'round')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">
                        {t("profile.avatarEditor.options.noseStyle.short")}
                      </SelectItem>
                      <SelectItem value="long">
                        {t("profile.avatarEditor.options.noseStyle.long")}
                      </SelectItem>
                      <SelectItem value="round">
                        {t("profile.avatarEditor.options.noseStyle.round")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.mouthStyle")}</Label>
                  <Select
                    value={config.mouthStyle || 'smile'}
                    onValueChange={(value) => updateConfig('mouthStyle', value as 'laugh' | 'smile' | 'peace')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laugh">
                        {t("profile.avatarEditor.options.mouthStyle.laugh")}
                      </SelectItem>
                      <SelectItem value="smile">
                        {t("profile.avatarEditor.options.mouthStyle.smile")}
                      </SelectItem>
                      <SelectItem value="peace">
                        {t("profile.avatarEditor.options.mouthStyle.peace")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Hair Tab */}
            <TabsContent value="hair" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.hairStyle")}</Label>
                  <Select
                    value={config.hairStyle || 'normal'}
                    onValueChange={(value) => updateConfig('hairStyle', value as 'normal' | 'thick' | 'mohawk' | 'womanLong' | 'womanShort')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">
                        {t("profile.avatarEditor.options.hairStyle.normal")}
                      </SelectItem>
                      {config.sex === "woman" ? (
                        <>
                          <SelectItem value="womanLong">
                            {t("profile.avatarEditor.options.hairStyle.womanLong")}
                          </SelectItem>
                          <SelectItem value="womanShort">
                            {t("profile.avatarEditor.options.hairStyle.womanShort")}
                          </SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="thick">
                            {t("profile.avatarEditor.options.hairStyle.thick")}
                          </SelectItem>
                          <SelectItem value="mohawk">
                            {t("profile.avatarEditor.options.hairStyle.mohawk")}
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.hairColor")}</Label>
                  <Select
                    value={config.hairColor || '#4A4A4A'}
                    onValueChange={(value) => updateConfig('hairColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#4A4A4A">
                        {t("profile.avatarEditor.options.hairColor.black")}
                      </SelectItem>
                      <SelectItem value="#8B4513">
                        {t("profile.avatarEditor.options.hairColor.brown")}
                      </SelectItem>
                      <SelectItem value="#D4A574">
                        {t("profile.avatarEditor.options.hairColor.blonde")}
                      </SelectItem>
                      <SelectItem value="#DC143C">
                        {t("profile.avatarEditor.options.hairColor.red")}
                      </SelectItem>
                      <SelectItem value="#FFD700">
                        {t("profile.avatarEditor.options.hairColor.gold")}
                      </SelectItem>
                      <SelectItem value="#708090">
                        {t("profile.avatarEditor.options.hairColor.gray")}
                      </SelectItem>
                      <SelectItem value="#FFFFFF">
                        {t("profile.avatarEditor.options.hairColor.white")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Accessories Tab */}
            <TabsContent value="accessories" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.hat")}</Label>
                  <Select
                    value={config.hatStyle || 'none'}
                    onValueChange={(value) => updateConfig('hatStyle', value as 'none' | 'beanie' | 'turban')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("profile.avatarEditor.options.hat.none")}
                      </SelectItem>
                      <SelectItem value="beanie">
                        {t("profile.avatarEditor.options.hat.beanie")}
                      </SelectItem>
                      <SelectItem value="turban">
                        {t("profile.avatarEditor.options.hat.turban")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.hatStyle !== 'none' && (
                  <div className="space-y-2">
                    <Label>{t("profile.avatarEditor.labels.hatColor")}</Label>
                    <Select
                      value={config.hatColor || '#000000'}
                      onValueChange={(value) => updateConfig('hatColor', value)}
                    >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#000000">
                        {t("profile.avatarEditor.options.hatColor.black")}
                      </SelectItem>
                      <SelectItem value="#FFFFFF">
                        {t("profile.avatarEditor.options.hatColor.white")}
                      </SelectItem>
                      <SelectItem value="#FF0000">
                        {t("profile.avatarEditor.options.hatColor.red")}
                      </SelectItem>
                      <SelectItem value="#0000FF">
                        {t("profile.avatarEditor.options.hatColor.blue")}
                      </SelectItem>
                      <SelectItem value="#008000">
                        {t("profile.avatarEditor.options.hatColor.green")}
                      </SelectItem>
                      <SelectItem value="#FFA500">
                        {t("profile.avatarEditor.options.hatColor.orange")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                )}

                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.glasses")}</Label>
                  <Select
                    value={config.glassesStyle || 'none'}
                    onValueChange={(value) => updateConfig('glassesStyle', value as 'none' | 'round' | 'square')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("profile.avatarEditor.options.glasses.none")}
                      </SelectItem>
                      <SelectItem value="round">
                        {t("profile.avatarEditor.options.glasses.round")}
                      </SelectItem>
                      <SelectItem value="square">
                        {t("profile.avatarEditor.options.glasses.square")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Other Tab */}
            <TabsContent value="other" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.clothing")}</Label>
                  <Select
                    value={config.shirtStyle || 'polo'}
                    onValueChange={(value) => updateConfig('shirtStyle', value as 'polo' | 'short' | 'hoody')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="polo">
                        {t("profile.avatarEditor.options.clothing.polo")}
                      </SelectItem>
                      <SelectItem value="short">
                        {t("profile.avatarEditor.options.clothing.short")}
                      </SelectItem>
                      <SelectItem value="hoody">
                        {t("profile.avatarEditor.options.clothing.hoody")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.clothingColor")}</Label>
                  <Select
                    value={config.shirtColor || '#FC909F'}
                    onValueChange={(value) => updateConfig('shirtColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#FC909F">
                        {t("profile.avatarEditor.options.clothingColor.pink")}
                      </SelectItem>
                      <SelectItem value="#73D1EF">
                        {t("profile.avatarEditor.options.clothingColor.blue")}
                      </SelectItem>
                      <SelectItem value="#50C878">
                        {t("profile.avatarEditor.options.clothingColor.green")}
                      </SelectItem>
                      <SelectItem value="#FF6B6B">
                        {t("profile.avatarEditor.options.clothingColor.red")}
                      </SelectItem>
                      <SelectItem value="#FFD93D">
                        {t("profile.avatarEditor.options.clothingColor.yellow")}
                      </SelectItem>
                      <SelectItem value="#6BCB77">
                        {t("profile.avatarEditor.options.clothingColor.lightGreen")}
                      </SelectItem>
                      <SelectItem value="#000000">
                        {t("profile.avatarEditor.options.clothingColor.black")}
                      </SelectItem>
                      <SelectItem value="#FFFFFF">
                        {t("profile.avatarEditor.options.clothingColor.white")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.backgroundColor")}</Label>
                  <Select
                    value={config.bgColor || '#F9C9B6'}
                    onValueChange={(value) => updateConfig('bgColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.isGradient
                        ? GRADIENT_BG_COLORS.map((value, index) => (
                            <SelectItem key={value} value={value}>
                              {t("profile.avatarEditor.options.backgroundColor.gradient", {
                                index: index + 1,
                                defaultValue: `Gradient ${index + 1}`,
                              })}
                            </SelectItem>
                          ))
                        : (
                            <>
                              <SelectItem value="#F9C9B6">
                                {t("profile.avatarEditor.options.backgroundColor.beige")}
                              </SelectItem>
                              <SelectItem value="#AC6651">
                                {t("profile.avatarEditor.options.backgroundColor.brown")}
                              </SelectItem>
                              <SelectItem value="#D08B5B">
                                {t("profile.avatarEditor.options.backgroundColor.orange")}
                              </SelectItem>
                              <SelectItem value="#F4D150">
                                {t("profile.avatarEditor.options.backgroundColor.yellow")}
                              </SelectItem>
                              <SelectItem value="#ED9C6E">
                                {t("profile.avatarEditor.options.backgroundColor.peach")}
                              </SelectItem>
                              <SelectItem value="#6C9BD1">
                                {t("profile.avatarEditor.options.backgroundColor.blue")}
                              </SelectItem>
                              <SelectItem value="#A8D5BA">
                                {t("profile.avatarEditor.options.backgroundColor.green")}
                              </SelectItem>
                              <SelectItem value="#E8B4D1">
                                {t("profile.avatarEditor.options.backgroundColor.pink")}
                              </SelectItem>
                              <SelectItem value="#FFFFFF">
                                {t("profile.avatarEditor.options.backgroundColor.white")}
                              </SelectItem>
                              <SelectItem value="#000000">
                                {t("profile.avatarEditor.options.backgroundColor.black")}
                              </SelectItem>
                            </>
                          )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.avatarEditor.labels.backgroundGradient")}</Label>
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <Switch
                      checked={Boolean(config.isGradient)}
                      onCheckedChange={(checked) => updateConfig('isGradient', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {t("profile.avatarEditor.labels.backgroundGradientHelp")}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("profile.avatarEditor.actions.cancel")}
            </Button>
            <Button onClick={handleSave}>
              {t("profile.avatarEditor.actions.save")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
