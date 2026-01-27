import { supabase } from './supabase';

export interface RunningLog {
  id: number;
  date: string;
  name: string | null;
  distance_km: number | null;
  duration_min: number | null;
  avg_pace: string | null;
  avg_hr: number | null;
  training_load: number | null;
}

export interface UserGoal {
  id: number;
  goal: string;
  is_active: boolean;
}

export interface PeriodStats {
  totalDistance: number;
  totalDuration: number;
  avgPace: string;
  runCount: number;
}

// 기간 계산 헬퍼
function getDateFromPeriod(days: number | null): string | null {
  if (days === null) return null;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// 최근 러닝 활동 가져오기 (기간 필터 + 페이지네이션)
export async function getRecentActivities(
  limit: number = 10,
  periodDays: number | null = null,
  offset: number = 0,
  dateRange?: { start: string; end: string }
): Promise<RunningLog[]> {
  let query = supabase
    .from('RunningLogs')
    .select('id, date, name, distance_km, duration_min, avg_pace, avg_hr, training_load')
    .order('date', { ascending: false });

  // 커스텀 날짜 범위가 있으면 우선 적용
  if (dateRange) {
    query = query.gte('date', dateRange.start).lte('date', dateRange.end);
  } else {
    const startDate = getDateFromPeriod(periodDays);
    if (startDate) {
      query = query.gte('date', startDate);
    }
  }

  if (limit > 0) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching running logs:', error);
    return [];
  }

  return data || [];
}

// 기간별 통계 계산
export async function getPeriodStats(
  periodDays: number | null = 7,
  dateRange?: { start: string; end: string }
): Promise<PeriodStats> {
  let query = supabase
    .from('RunningLogs')
    .select('distance_km, duration_min');

  // 커스텀 날짜 범위가 있으면 우선 적용
  if (dateRange) {
    query = query.gte('date', dateRange.start).lte('date', dateRange.end);
  } else {
    const startDate = getDateFromPeriod(periodDays);
    if (startDate) {
      query = query.gte('date', startDate);
    }
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Error fetching period stats:', error);
    return {
      totalDistance: 0,
      totalDuration: 0,
      avgPace: '-',
      runCount: 0,
    };
  }

  const totalDistance = data.reduce((sum, log) => sum + (log.distance_km || 0), 0);
  const totalDuration = data.reduce((sum, log) => sum + (log.duration_min || 0), 0);

  let avgPace = '-';
  if (totalDistance > 0) {
    const paceMin = totalDuration / totalDistance;
    const minutes = Math.floor(paceMin);
    const seconds = Math.round((paceMin - minutes) * 60);
    avgPace = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return {
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalDuration: Math.round(totalDuration),
    avgPace,
    runCount: data.length,
  };
}

// 주간 통계 (하위 호환성)
export async function getWeeklyStats(): Promise<PeriodStats> {
  return getPeriodStats(7);
}

// 현재 목표 가져오기
export async function getCurrentGoal(): Promise<UserGoal | null> {
  const { data, error } = await supabase
    .from('UserGoals')
    .select('id, goal, is_active')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching goal:', error);
    return null;
  }

  return data;
}
