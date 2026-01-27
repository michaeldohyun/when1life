import { getRecentActivities, getWeeklyStats, getCurrentGoal } from '@/lib/running';
import { ArrowLeft, Target, TrendingUp, Clock, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function RunningPage() {
  const [activities, weeklyStats, goal] = await Promise.all([
    getRecentActivities(5),
    getWeeklyStats(),
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

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Distance
          </div>
          <p className="text-lg font-medium text-foreground">
            {weeklyStats.totalDistance} <span className="text-xs text-muted-foreground">km</span>
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5" />
            Duration
          </div>
          <p className="text-lg font-medium text-foreground">
            {weeklyStats.totalDuration} <span className="text-xs text-muted-foreground">min</span>
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Activity className="w-3.5 h-3.5" />
            Avg Pace
          </div>
          <p className="text-lg font-medium text-foreground">
            {weeklyStats.avgPace} <span className="text-xs text-muted-foreground">/km</span>
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            Runs
          </div>
          <p className="text-lg font-medium text-foreground">
            {weeklyStats.runCount} <span className="text-xs text-muted-foreground">this week</span>
          </p>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-4">Recent Activities</h2>
        {activities.length > 0 ? (
          <div className="border border-border divide-y divide-border">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">
                    {activity.name || `${activity.distance_km?.toFixed(1)} km run`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {activity.avg_hr && ` · ${activity.avg_hr} bpm`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">
                    {activity.distance_km?.toFixed(1)} km
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.avg_pace || '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No activities yet</p>
          </div>
        )}
      </div>

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
