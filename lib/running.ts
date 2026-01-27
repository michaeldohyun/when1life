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

export interface WeeklyStats {
  totalDistance: number;
  totalDuration: number;
  avgPace: string;
  runCount: number;
}

// 최근 러닝 활동 가져오기
export async function getRecentActivities(limit: number = 5): Promise<RunningLog[]> {
  const { data, error } = await supabase
    .from('RunningLogs')
    .select('id, date, name, distance_km, duration_min, avg_pace, avg_hr, training_load')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching running logs:', error);
    return [];
  }

  return data || [];
}

// 주간 통계 계산
export async function getWeeklyStats(): Promise<WeeklyStats> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('RunningLogs')
    .select('distance_km, duration_min')
    .gte('date', oneWeekAgo.toISOString().split('T')[0]);

  if (error || !data) {
    console.error('Error fetching weekly stats:', error);
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
