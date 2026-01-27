'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <footer className="border-t mt-auto">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>&copy;2026 when1log</span>
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
