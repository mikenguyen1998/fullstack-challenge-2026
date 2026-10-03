import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error?: unknown;
  onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const message = error instanceof Error ? error.message : undefined;

  return (
    <div
      role="alert"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-slate-600 dark:text-slate-400">
        An unexpected error occurred. Please try again.
      </p>
      {import.meta.env.DEV && message && (
        <pre className="max-w-xl overflow-auto rounded-lg bg-red-50 p-3 text-left text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
          {message}
        </pre>
      )}
      <Button onClick={onReset ?? (() => window.location.reload())}>Try again</Button>
    </div>
  );
}
