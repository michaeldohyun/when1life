'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const { isAdmin, user, signInWithGoogle, signOut } = useAuth();

  return (
    <footer className="border-t mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground/60">
          <span>&copy; 2025 when1log</span>
          <span>&middot;</span>
          {user ? (
            <>
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className="hover:text-muted-foreground transition-colors"
                  >
                    관리자
                  </Link>
                  <span>&middot;</span>
                </>
              )}
              <button
                onClick={() => signOut()}
                className="hover:text-muted-foreground transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="hover:text-muted-foreground transition-colors"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
