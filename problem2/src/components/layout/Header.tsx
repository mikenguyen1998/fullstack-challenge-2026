import { ThemeToggle } from '@/components/common/ThemeToggle';
import { env } from '@/config/env';

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <span className="text-brand-fg text-lg font-bold">{env.appName}</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
