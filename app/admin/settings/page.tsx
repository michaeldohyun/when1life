'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">설정</h1>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-medium text-foreground mb-4">
          계정 정보
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              이메일
            </label>
            <p className="text-foreground">{user?.email}</p>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              계정 ID
            </label>
            <p className="text-sm text-muted-foreground font-mono">
              {user?.id}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-medium text-foreground mb-4">
          프로젝트 정보
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Supabase 프로젝트
            </label>
            <p className="text-sm text-muted-foreground">
              dotsosqsftympgdescvz (when1log)
            </p>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              스키마
            </label>
            <p className="text-sm text-muted-foreground">clipper</p>
          </div>
        </div>
      </div>
    </div>
  );
}
