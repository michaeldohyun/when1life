import {
  getRecentSessions,
  getLatestBodyComposition,
  getCurrentGoal,
  getCurrentTheory,
  formatDuration,
} from '@/lib/fasting';
import { ArrowLeft, Target, Scale, Timer, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function FastingPage() {
  const [sessions, bodyComp, goal, theory] = await Promise.all([
    getRecentSessions(5),
    getLatestBodyComposition(),
    getCurrentGoal(),
    getCurrentTheory(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-foreground">Fasting Coach</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Intermittent fasting tracker with body composition
          </p>
        </div>
      </div>

      {/* Current Protocol */}
      {theory && (
        <div className="border border-border p-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Clock className="w-3.5 h-3.5" />
            Current Protocol
          </div>
          <p className="text-sm text-foreground">
            {theory.theory_name} ({theory.fasting_hours}:{theory.eating_window_hours})
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Current Weight */}
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Scale className="w-3.5 h-3.5" />
            Weight
          </div>
          <p className="text-lg font-medium text-foreground">
            {bodyComp?.weight_kg?.toFixed(1) || '-'}{' '}
            <span className="text-xs text-muted-foreground">kg</span>
          </p>
        </div>

        {/* Body Fat */}
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            Body Fat
          </div>
          <p className="text-lg font-medium text-foreground">
            {bodyComp?.body_fat_pct?.toFixed(1) || '-'}{' '}
            <span className="text-xs text-muted-foreground">%</span>
          </p>
        </div>

        {/* Target Weight */}
        {goal && (
          <div className="border border-border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Target className="w-3.5 h-3.5" />
              Target
            </div>
            <p className="text-lg font-medium text-foreground">
              {goal.target_weight_kg}{' '}
              <span className="text-xs text-muted-foreground">kg</span>
            </p>
          </div>
        )}

        {/* Total Sessions */}
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Timer className="w-3.5 h-3.5" />
            Sessions
          </div>
          <p className="text-lg font-medium text-foreground">
            {sessions.length}{' '}
            <span className="text-xs text-muted-foreground">recent</span>
          </p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-4">Recent Fasting Sessions</h2>
        {sessions.length > 0 ? (
          <div className="border border-border divide-y divide-border">
            {sessions.map((session) => (
              <div key={session.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">
                    {new Date(session.started_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Started{' '}
                    {new Date(session.started_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">
                    {session.duration_minutes
                      ? formatDuration(session.duration_minutes)
                      : 'In progress'}
                  </p>
                  {session.goal_reached && (
                    <p className="text-xs text-muted-foreground">Goal reached</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No fasting sessions yet</p>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="mt-8 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Interested in this workflow?{' '}
          <a
            href="https://t.me/michaeldohyun"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Contact me on Telegram
          </a>
        </p>
      </div>
    </div>
  );
}
