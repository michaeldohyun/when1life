'use client';

import { useState, useEffect, useRef } from 'react';
import { PeriodFilter, Period, DateRange } from '@/components/PeriodFilter';
import {
  formatDuration,
  type FastingStats,
  type FastingSession,
} from '@/lib/fasting';
import { Timer, CheckCircle, Percent } from 'lucide-react';

interface FastingClientProps {
  initialStats: FastingStats;
  initialSessions: FastingSession[];
}

const periodToDays: Record<Exclude<Period, 'custom'>, number | null> = {
  '7': 7,
  '30': 30,
  '90': 90,
  'all': null,
};

const periodLabels: Record<Exclude<Period, 'custom'>, string> = {
  '7': 'last 7 days',
  '30': 'last 30 days',
  '90': 'last 90 days',
  'all': 'all time',
};

const PAGE_SIZE = 10;

export function FastingClient({ initialStats, initialSessions }: FastingClientProps) {
  const [period, setPeriod] = useState<Period>('7');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [stats, setStats] = useState<FastingStats>(initialStats);
  const [sessions, setSessions] = useState<FastingSession[]>(initialSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialSessions.length >= PAGE_SIZE);
  const isFirstRender = useRef(true);

  const handlePeriodChange = (newPeriod: Period, newDateRange?: DateRange) => {
    setPeriod(newPeriod);
    setDateRange(newDateRange);
  };

  const buildQueryParams = (offset: number = 0) => {
    const params = new URLSearchParams();
    params.set('limit', PAGE_SIZE.toString());
    params.set('offset', offset.toString());

    if (period === 'custom' && dateRange) {
      params.set('startDate', dateRange.start);
      params.set('endDate', dateRange.end);
    } else if (period !== 'custom') {
      const days = periodToDays[period];
      params.set('days', String(days));
    }

    return params.toString();
  };

  useEffect(() => {
    // Skip first render - use server-provided initial data
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // custom 기간이지만 날짜 범위가 없으면 fetch하지 않음
    if (period === 'custom' && !dateRange) {
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      const res = await fetch(`/api/fasting/stats?${buildQueryParams(0)}`);
      const data = await res.json();
      setStats(data.stats);
      setSessions(data.sessions);
      setHasMore(data.sessions.length >= PAGE_SIZE);
      setIsLoading(false);
    }

    fetchData();
  }, [period, dateRange]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    const res = await fetch(`/api/fasting/stats?${buildQueryParams(sessions.length)}`);
    const data = await res.json();
    setSessions((prev) => [...prev, ...data.sessions]);
    setHasMore(data.sessions.length >= PAGE_SIZE);
    setIsLoadingMore(false);
  };

  return (
    <>
      {/* Period Filter */}
      <div className="mb-6">
        <PeriodFilter selected={period} onChange={handlePeriodChange} dateRange={dateRange} />
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Timer className="w-3.5 h-3.5" />
            Sessions
          </div>
          <p className="text-lg font-medium text-foreground">
            {stats.sessionCount}{' '}
            <span className="text-xs text-muted-foreground">{period === 'custom' ? 'selected period' : periodLabels[period]}</span>
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            Avg Duration
          </div>
          <p className="text-lg font-medium text-foreground">
            {stats.avgFastingMinutes > 0 ? formatDuration(stats.avgFastingMinutes) : '-'}
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Goals Met
          </div>
          <p className="text-lg font-medium text-foreground">
            {stats.goalReachedCount}{' '}
            <span className="text-xs text-muted-foreground">times</span>
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Percent className="w-3.5 h-3.5" />
            Success
          </div>
          <p className="text-lg font-medium text-foreground">
            {stats.successRate}{' '}
            <span className="text-xs text-muted-foreground">%</span>
          </p>
        </div>
      </div>

      {/* Sessions */}
      <div className={`transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
        <h2 className="text-sm font-medium text-foreground mb-4">
          Sessions
          {sessions.length > 0 && (
            <span className="text-muted-foreground font-normal ml-2">
              ({sessions.length}{hasMore ? '+' : ''})
            </span>
          )}
        </h2>
        {sessions.length > 0 ? (
          <>
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
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="w-full mt-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </>
        ) : (
          <div className="border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No sessions in this period</p>
          </div>
        )}
      </div>
    </>
  );
}
