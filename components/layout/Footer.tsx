'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <footer className="border-t mt-auto print:hidden">
      <div className="mx-auto max-w-[52rem] px-6 py-4">
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          {/* © 텍스트가 어드민 진입점 — 비로그인: 구글 로그인 / 로그인: 어드민 이동 */}
          {user ? (
            <>
              <Link href="/admin" className="hover:text-foreground transition-colors">
                &copy; 2026 Michael Kim
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
              className="hover:text-foreground transition-colors cursor-default"
              aria-label="© 2026 Michael Kim"
            >
              &copy; 2026 Michael Kim
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
