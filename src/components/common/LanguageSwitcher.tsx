import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'sidebar';
}

export default function LanguageSwitcher({ className, variant = 'default' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const onChange = (value: string) => {
    if (value) i18n.changeLanguage(value);
  };

  const baseClasses = variant === 'sidebar' 
    ? 'bg-muted/50 hover:bg-muted rounded-md gap-0'
    : 'gap-0';

  return (
    <ToggleGroup
      type="single"
      value={i18n.language}
      onValueChange={onChange}
      className={`${baseClasses} ${className || ''}`.trim()}
    >
      <ToggleGroupItem value="de" aria-label="Deutsch" size={variant === 'sidebar' ? 'sm' : 'default'}>
        🇩🇪
      </ToggleGroupItem>
      <ToggleGroupItem value="en" aria-label="English" size={variant === 'sidebar' ? 'sm' : 'default'}>
        🇺🇸
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
