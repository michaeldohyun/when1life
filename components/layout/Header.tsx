'use client';

import Link from 'next/link';
import { ThemeToggleIcon } from '@/components/ui/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <nav className="mx-auto max-w-3xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-medium tracking-tight text-foreground hover:text-muted-foreground transition-colors"
          >
            when1life
          </Link>

          <ThemeToggleIcon />
        </div>
      </nav>
    </header>
  );
}
