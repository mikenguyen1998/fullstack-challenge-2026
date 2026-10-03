import { Button } from '@/components/ui/button';
import { useUiStore } from '@/stores/ui.store';
import { Monitor, Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  const toggleTheme = () => {
    if (theme === 'light') return setTheme('dark');
    if (theme === 'dark') return setTheme('system');
    setTheme('light');
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <Button onClick={toggleTheme} aria-label={`Theme: ${theme}`}>
      <ThemeIcon />
    </Button>
  );
}
