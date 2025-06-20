import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const onChange = (value: string) => {
    if (value) i18n.changeLanguage(value);
  };

  return (
    <ToggleGroup
      type="single"
      value={i18n.language}
      onValueChange={onChange}
      className={`gap-0 ${className || ''}`.trim()}
    >
      <ToggleGroupItem value="de" aria-label="Deutsch">
        🇩🇪
      </ToggleGroupItem>
      <ToggleGroupItem value="en" aria-label="English">
        🇺🇸
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
