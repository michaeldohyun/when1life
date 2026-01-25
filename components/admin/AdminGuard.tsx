'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogIn } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, isLoading, isDev, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로컬 환경에서는 체크 안함
    if (!isDev && !isLoading && !isAdmin && user) {
      router.push('/');
    }
  }, [isLoading, isAdmin, isDev, router, user]);

  // 로컬 환경에서는 바로 통과
  if (isDev) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            로그인이 필요합니다
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            관리자 페이지에 접근하려면 Google 계정으로 로그인하세요.
          </p>
          <button
            onClick={() => signInWithGoogle()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Google로 로그인
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            접근 권한 없음
          </h1>
          <p className="text-[var(--text-secondary)] mb-2">
            관리자만 접근할 수 있습니다.
          </p>
          <p className="text-sm text-[var(--text-tertiary)]">
            현재 계정: {user.email}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
