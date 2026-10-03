import HomePage from '@/pages/HomePage';
import { Header } from './Header';

export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <HomePage />
      </main>
    </div>
  );
}
