'use client';

import Link from 'next/link';
import { ThemeToggleIcon } from '@/components/ui/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b print:hidden">
      <nav className="mx-auto max-w-3xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-medium tracking-tight text-foreground hover:text-muted-foreground transition-colors"
          >
            Michael Kim
          </Link>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4 text-xs">
              <Link
                href="/work"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Work
              </Link>
              <Link
                href="/resume"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Resume
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </nav>
            <ThemeToggleIcon />
          </div>
        </div>
      </nav>
    </header>
  );
}
