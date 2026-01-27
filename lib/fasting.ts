import { supabase } from './supabase';

export interface FastingSession {
  id: number;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  goal_reached: boolean;
}

export interface BodyComposition {
  id: number;
  measured_at: string;
  weight_kg: number;
  body_fat_pct: number | null;
  skeletal_muscle_kg: number | null;
}

export interface FastingGoal {
  id: number;
  target_weight_kg: number;
  target_body_fat_pct: number | null;
  current_weight_kg: number | null;
}

export interface FastingTheory {
  id: number;
  theory_name: string;
  fasting_hours: number;
  eating_window_hours: number;
}

// 최근 단식 세션 가져오기
export async function getRecentSessions(limit: number = 5): Promise<FastingSession[]> {
  const { data, error } = await supabase
    .from('FastingSessions')
    .select('id, started_at, ended_at, duration_minutes, goal_reached')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching fasting sessions:', error);
    return [];
  }

  return data || [];
}

// 최근 체성분 기록 가져오기
export async function getLatestBodyComposition(): Promise<BodyComposition | null> {
  const { data, error } = await supabase
    .from('BodyCompositionLogs')
    .select('id, measured_at, weight_kg, body_fat_pct, skeletal_muscle_kg')
    .order('measured_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching body composition:', error);
    return null;
  }

  return data;
}

// 현재 목표 가져오기
export async function getCurrentGoal(): Promise<FastingGoal | null> {
  const { data, error } = await supabase
    .from('FastingUserGoals')
    .select('id, target_weight_kg, target_body_fat_pct, current_weight_kg')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching fasting goal:', error);
    return null;
  }

  return data;
}

// 현재 적용 중인 단식 이론 가져오기
export async function getCurrentTheory(): Promise<FastingTheory | null> {
  const { data, error } = await supabase
    .from('FastingDietTheories')
    .select('id, theory_name, fasting_hours, eating_window_hours')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching fasting theory:', error);
    return null;
  }

  return data;
}

// 단식 시간 포맷
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}
