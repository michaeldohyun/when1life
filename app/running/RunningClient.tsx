'use client';

import { useState, useEffect, useRef } from 'react';
import { PeriodFilter, Period, DateRange } from '@/components/PeriodFilter';
import { type PeriodStats, type RunningLog } from '@/lib/running';
import { TrendingUp, Clock, Activity } from 'lucide-react';

interface RunningClientProps {
  initialStats: PeriodStats;
  initialActivities: RunningLog[];
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

export function RunningClient({ initialStats, initialActivities }: RunningClientProps) {
  const [period, setPeriod] = useState<Period>('7');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [stats, setStats] = useState<PeriodStats>(initialStats);
  const [activities, setActivities] = useState<RunningLog[]>(initialActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialActivities.length >= PAGE_SIZE);
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
      const res = await fetch(`/api/running/stats?${buildQueryParams(0)}`);
      const data = await res.json();
      setStats(data.stats);
      setActivities(data.activities);
      setHasMore(data.activities.length >= PAGE_SIZE);
      setIsLoading(false);
    }

    fetchData();
  }, [period, dateRange]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    const res = await fetch(`/api/running/stats?${buildQueryParams(activities.length)}`);
    const data = await res.json();
    setActivities((prev) => [...prev, ...data.activities]);
    setHasMore(data.activities.length >= PAGE_SIZE);
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
            <TrendingUp className="w-3.5 h-3.5" />
            Distance
          </div>
          <p className="text-lg font-medium text-foreground">
            {stats.totalDistance} <span className="text-xs text-muted-foreground">km</span>
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5" />
            Duration
          </div>
          <p className="text-lg font-medium text-foreground">
            {stats.totalDuration} <span className="text-xs text-muted-foreground">min</span>
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Activity className="w-3.5 h-3.5" />
            Avg Pace
          </div>
          <p className="text-lg font-medium text-foreground">
            {stats.avgPace} <span className="text-xs text-muted-foreground">/km</span>
          </p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            Runs
          </div>
          <p className="text-lg font-medium text-foreground">
            {stats.runCount} <span className="text-xs text-muted-foreground">{period === 'custom' ? 'selected period' : periodLabels[period]}</span>
          </p>
        </div>
      </div>

      {/* Activities */}
      <div className={`transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
        <h2 className="text-sm font-medium text-foreground mb-4">
          Activities
          {activities.length > 0 && (
            <span className="text-muted-foreground font-normal ml-2">
              ({activities.length}{hasMore ? '+' : ''})
            </span>
          )}
        </h2>
        {activities.length > 0 ? (
          <>
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
            <p className="text-sm text-muted-foreground">No activities in this period</p>
          </div>
        )}
      </div>
    </>
  );
}
