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

export interface FastingStats {
  sessionCount: number;
  totalFastingMinutes: number;
  avgFastingMinutes: number;
  goalReachedCount: number;
  successRate: number;
}

// 기간 계산 헬퍼
function getDateFromPeriod(days: number | null): string | null {
  if (days === null) return null;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

// 최근 단식 세션 가져오기 (기간 필터 + 페이지네이션)
export async function getRecentSessions(
  limit: number = 10,
  periodDays: number | null = null,
  offset: number = 0,
  dateRange?: { start: string; end: string }
): Promise<FastingSession[]> {
  let query = supabase
    .from('FastingSessions')
    .select('id, started_at, ended_at, duration_minutes, goal_reached')
    .order('started_at', { ascending: false });

  // 커스텀 날짜 범위가 있으면 우선 적용
  if (dateRange) {
    query = query.gte('started_at', dateRange.start).lte('started_at', dateRange.end);
  } else {
    const startDate = getDateFromPeriod(periodDays);
    if (startDate) {
      query = query.gte('started_at', startDate);
    }
  }

  if (limit > 0) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching fasting sessions:', error);
    return [];
  }

  return data || [];
}

// 기간별 단식 통계 계산
export async function getPeriodStats(
  periodDays: number | null = 7,
  dateRange?: { start: string; end: string }
): Promise<FastingStats> {
  let query = supabase
    .from('FastingSessions')
    .select('duration_minutes, goal_reached');

  // 커스텀 날짜 범위가 있으면 우선 적용
  if (dateRange) {
    query = query.gte('started_at', dateRange.start).lte('started_at', dateRange.end);
  } else {
    const startDate = getDateFromPeriod(periodDays);
    if (startDate) {
      query = query.gte('started_at', startDate);
    }
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Error fetching fasting stats:', error);
    return {
      sessionCount: 0,
      totalFastingMinutes: 0,
      avgFastingMinutes: 0,
      goalReachedCount: 0,
      successRate: 0,
    };
  }

  const completedSessions = data.filter((s) => s.duration_minutes !== null);
  const totalFastingMinutes = completedSessions.reduce(
    (sum, s) => sum + (s.duration_minutes || 0),
    0
  );
  const goalReachedCount = data.filter((s) => s.goal_reached).length;

  return {
    sessionCount: data.length,
    totalFastingMinutes,
    avgFastingMinutes:
      completedSessions.length > 0
        ? Math.round(totalFastingMinutes / completedSessions.length)
        : 0,
    goalReachedCount,
    successRate:
      data.length > 0 ? Math.round((goalReachedCount / data.length) * 100) : 0,
  };
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

// 체성분 히스토리 가져오기 (그래프용)
export interface BodyCompositionHistory {
  measured_at: string;
  weight_kg: number;
  body_fat_pct: number | null;
  muscle_mass_kg: number | null;
}

export async function getBodyCompositionHistory(
  days: number = 90
): Promise<BodyCompositionHistory[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('BodyCompositionLogs')
    .select('measured_at, weight_kg, body_fat_pct, muscle_mass_kg')
    .gte('measured_at', startDate.toISOString())
    .order('measured_at', { ascending: true });

  if (error) {
    console.error('Error fetching body composition history:', error);
    return [];
  }

  return data || [];
}

// 체성분과 단식 세션 상관관계 데이터
export interface WeightWithFasting {
  date: string;
  weight_kg: number;
  body_fat_pct: number | null;
  hadFastingSession: boolean;
  fastingDuration: number | null;
}

export async function getWeightWithFastingCorrelation(
  days: number = 90
): Promise<WeightWithFasting[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 체성분 데이터
  const { data: bodyData, error: bodyError } = await supabase
    .from('BodyCompositionLogs')
    .select('measured_at, weight_kg, body_fat_pct')
    .gte('measured_at', startDate.toISOString())
    .order('measured_at', { ascending: true });

  if (bodyError || !bodyData) {
    console.error('Error fetching body data:', bodyError);
    return [];
  }

  // 단식 세션 데이터
  const { data: fastingData, error: fastingError } = await supabase
    .from('FastingSessions')
    .select('started_at, ended_at, duration_minutes')
    .gte('started_at', startDate.toISOString());

  if (fastingError) {
    console.error('Error fetching fasting data:', fastingError);
  }

  // 날짜별로 단식 세션 매핑
  const fastingByDate: Record<string, number> = {};
  (fastingData || []).forEach((session) => {
    const date = session.started_at.split('T')[0];
    fastingByDate[date] = session.duration_minutes || 0;
  });

  // 체성분 데이터에 단식 여부 결합
  return bodyData.map((body) => {
    const date = body.measured_at.split('T')[0];
    // 측정일 전날의 단식 여부 확인 (전날 단식이 다음날 체중에 영향)
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    return {
      date,
      weight_kg: body.weight_kg,
      body_fat_pct: body.body_fat_pct,
      hadFastingSession: !!fastingByDate[prevDateStr],
      fastingDuration: fastingByDate[prevDateStr] || null,
    };
  });
}

// 목표 진행률 계산
export function calculateGoalProgress(
  currentWeight: number,
  targetWeight: number,
  startWeight: number
): number {
  if (startWeight <= targetWeight) return 100;
  const totalToLose = startWeight - targetWeight;
  const lost = startWeight - currentWeight;
  return Math.min(100, Math.max(0, Math.round((lost / totalToLose) * 100)));
}
