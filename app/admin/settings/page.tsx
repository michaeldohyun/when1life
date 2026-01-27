'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-lg font-medium text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Account and project information
        </p>
      </div>

      <div className="border border-border divide-y divide-border">
        {/* Account Info */}
        <div className="p-4">
          <h2 className="text-xs font-medium text-foreground mb-3">
            Account
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] text-muted-foreground mb-0.5">
                Email
              </label>
              <p className="text-sm text-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-0.5">
                User ID
              </label>
              <p className="text-[10px] text-muted-foreground font-mono truncate">
                {user?.id}
              </p>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="p-4">
          <h2 className="text-xs font-medium text-foreground mb-3">
            Project
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] text-muted-foreground mb-0.5">
                Supabase Project
              </label>
              <p className="text-xs text-muted-foreground">
                dotsosqsftympgdescvz (when1log)
              </p>
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-0.5">
                Schema
              </label>
              <p className="text-xs text-muted-foreground">clipper</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
