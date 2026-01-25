'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isDev: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  const isDev = process.env.NODE_ENV === 'development';
  // 로컬 환경에서는 무조건 관리자
  const isAdmin = isDev || (user?.email ? adminEmails.includes(user.email) : false);

  useEffect(() => {
    // 세션 복원
    supabase.auth.getSession().then(({ data: { session } }) => {
      // 관리자가 아니면 로그아웃
      if (
        session?.user?.email &&
        adminEmails.length > 0 &&
        !adminEmails.includes(session.user.email)
      ) {
        supabase.auth.signOut();
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // 관리자가 아니면 로그아웃
      if (
        session?.user?.email &&
        adminEmails.length > 0 &&
        !adminEmails.includes(session.user.email)
      ) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // PKCE flow: callback route로 리다이렉트
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isAdmin, isLoading, isDev, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
