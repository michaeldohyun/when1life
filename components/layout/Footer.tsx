'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <footer className="border-t mt-auto print:hidden">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>&copy; 2026 Michael Kim</span>
          <span>&middot;</span>
          <a
            href="mailto:michael.dohyun@gmail.com"
            className="hover:text-foreground transition-colors"
          >
            Email
          </a>
          <span>&middot;</span>
          <a
            href="https://www.linkedin.com/in/michaeldohyun"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
          <span>&middot;</span>
          {user ? (
            <>
              <Link
                href="/admin"
                className="hover:text-foreground transition-colors"
              >
                Admin
              </Link>
              <span>&middot;</span>
              <button
                onClick={() => signOut()}
                className="hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="hover:text-foreground transition-colors"
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
