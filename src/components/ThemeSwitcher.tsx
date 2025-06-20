import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

interface ThemeSwitcherProps {
  className?: string;
}

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const current = resolvedTheme || theme;

  return (
    <div className={`flex items-center gap-2 ${className || ''}`.trim()}>
      <Sun className="h-4 w-4" />
      <Switch
        checked={current === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Toggle theme"
      />
      <Moon className="h-4 w-4" />
    </div>
  );
}
