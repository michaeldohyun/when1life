import { getRecentActivities, getPeriodStats, getCurrentGoal } from '@/lib/running';
import { ArrowLeft, Target, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { RunningClient } from './RunningClient';

function getDefaultYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month === 0) {
    return `${year - 1}-12`;
  }
  return `${year}-${month.toString().padStart(2, '0')}`;
}

export default async function RunningPage() {
  const [activities, stats, goal] = await Promise.all([
    getRecentActivities(10, 7),
    getPeriodStats(7),
    getCurrentGoal(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/workflows"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-foreground">Running Coach</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            80/20 running methodology with smart training
          </p>
        </div>
      </div>

      {/* Monthly Word Cloud */}
      <Link
        href={`/running/monthly/wordcloud?month=${getDefaultYearMonth()}`}
        className="block border border-border hover:border-neutral-600 p-4 mb-6 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
            <span className="text-sm text-neutral-300">월간 러닝 정산</span>
          </div>
          <span className="text-xs text-neutral-500">→</span>
        </div>
      </Link>

      {/* Current Goal */}
      {goal && (
        <div className="border border-border p-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Target className="w-3.5 h-3.5" />
            Current Goal
          </div>
          <p className="text-sm text-foreground">{goal.goal}</p>
        </div>
      )}

      {/* Client Component with Filter */}
      <RunningClient initialStats={stats} initialActivities={activities} />

      {/* Contact */}
      <div className="mt-8 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Interested in this workflow?{' '}
          <a
            href="https://t.me/when1log"
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
