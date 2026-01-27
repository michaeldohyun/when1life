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
    if (!isDev && !isLoading && !isAdmin && user) {
      router.push('/');
    }
  }, [isLoading, isAdmin, isDev, router, user]);

  if (isDev) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-sm">
          <h1 className="text-lg font-medium text-foreground mb-2">
            Login Required
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with Google to access admin.
          </p>
          <button
            onClick={() => signInWithGoogle()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-sm">
          <h1 className="text-lg font-medium text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            Admin access only.
          </p>
          <p className="text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
