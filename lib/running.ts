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

// ============================================
// 월간 정산 관련 함수
// ============================================

export interface MonthlyStats {
  yearMonth: string;
  totalDistance: number;
  totalDuration: number;
  avgPace: string;
  avgHr: number | null;
  runCount: number;
  totalTrainingLoad: number;
}

export interface MonthlyComparison {
  current: MonthlyStats;
  previous: MonthlyStats | null;
  changes: {
    distanceChange: number; // 퍼센트
    durationChange: number;
    paceChange: number; // 초 단위 (음수 = 빨라짐)
    hrChange: number | null; // bpm (음수 = 낮아짐 = 좋음)
    runCountChange: number;
    trainingLoadChange: number;
  };
}

export interface MonthlySummary {
  id: number;
  year_month: string;
  total_distance_km: number | null;
  total_duration_min: number | null;
  avg_pace: string | null;
  avg_hr: number | null;
  run_count: number | null;
  total_training_load: number | null;
  prev_total_distance_km: number | null;
  prev_total_duration_min: number | null;
  prev_avg_pace: string | null;
  prev_avg_hr: number | null;
  prev_run_count: number | null;
  prev_total_training_load: number | null;
  llm_analysis: string | null;
  image_url: string | null;
  created_at: string;
  telegram_sent_at: string | null;
}

// 특정 월의 시작일과 종료일 계산
function getMonthDateRange(yearMonth: string): { start: string; end: string } {
  const [year, month] = yearMonth.split('-').map(Number);
  const start = `${year}-${month.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
  return { start, end };
}

// 이전 월 계산
function getPreviousMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  if (month === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${(month - 1).toString().padStart(2, '0')}`;
}

// 페이스 문자열을 초로 변환
function paceToSeconds(pace: string): number {
  if (!pace || pace === '-') return 0;
  const [min, sec] = pace.split(':').map(Number);
  return min * 60 + (sec || 0);
}

// 초를 페이스 문자열로 변환
function secondsToPace(seconds: number): string {
  if (seconds <= 0) return '-';
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// 특정 월의 통계 계산
export async function getMonthlyStats(yearMonth: string): Promise<MonthlyStats> {
  const { start, end } = getMonthDateRange(yearMonth);

  const { data, error } = await supabase
    .from('RunningLogs')
    .select('distance_km, duration_min, avg_hr, training_load')
    .gte('date', start)
    .lte('date', end);

  if (error || !data || data.length === 0) {
    return {
      yearMonth,
      totalDistance: 0,
      totalDuration: 0,
      avgPace: '-',
      avgHr: null,
      runCount: 0,
      totalTrainingLoad: 0,
    };
  }

  const totalDistance = data.reduce((sum, log) => sum + (log.distance_km || 0), 0);
  const totalDuration = data.reduce((sum, log) => sum + (log.duration_min || 0), 0);
  const totalTrainingLoad = data.reduce((sum, log) => sum + (log.training_load || 0), 0);

  // 심박수 평균 (null 제외)
  const hrValues = data.filter((log) => log.avg_hr !== null).map((log) => log.avg_hr as number);
  const avgHr = hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : null;

  // 평균 페이스
  let avgPace = '-';
  if (totalDistance > 0) {
    const paceMin = totalDuration / totalDistance;
    const minutes = Math.floor(paceMin);
    const seconds = Math.round((paceMin - minutes) * 60);
    avgPace = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return {
    yearMonth,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalDuration: Math.round(totalDuration),
    avgPace,
    avgHr,
    runCount: data.length,
    totalTrainingLoad: Math.round(totalTrainingLoad),
  };
}

// 두 달 비교
export async function getMonthlyComparison(yearMonth: string): Promise<MonthlyComparison> {
  const current = await getMonthlyStats(yearMonth);
  const prevYearMonth = getPreviousMonth(yearMonth);
  const previous = await getMonthlyStats(prevYearMonth);

  // 변화량 계산
  const distanceChange =
    previous.totalDistance > 0 ? Math.round(((current.totalDistance - previous.totalDistance) / previous.totalDistance) * 100) : 0;

  const durationChange =
    previous.totalDuration > 0 ? Math.round(((current.totalDuration - previous.totalDuration) / previous.totalDuration) * 100) : 0;

  const currentPaceSec = paceToSeconds(current.avgPace);
  const prevPaceSec = paceToSeconds(previous.avgPace);
  const paceChange = prevPaceSec > 0 ? currentPaceSec - prevPaceSec : 0;

  const hrChange = current.avgHr !== null && previous.avgHr !== null ? current.avgHr - previous.avgHr : null;

  const runCountChange = current.runCount - previous.runCount;

  const trainingLoadChange =
    previous.totalTrainingLoad > 0
      ? Math.round(((current.totalTrainingLoad - previous.totalTrainingLoad) / previous.totalTrainingLoad) * 100)
      : 0;

  return {
    current,
    previous: previous.runCount > 0 ? previous : null,
    changes: {
      distanceChange,
      durationChange,
      paceChange,
      hrChange,
      runCountChange,
      trainingLoadChange,
    },
  };
}

// 저장된 월간 정산 가져오기
export async function getMonthlySummary(yearMonth: string): Promise<MonthlySummary | null> {
  const { data, error } = await supabase
    .from('MonthlyRunningSummary')
    .select('*')
    .eq('year_month', yearMonth)
    .maybeSingle();

  if (error) {
    console.error('Error fetching monthly summary:', error);
    return null;
  }

  return data;
}

// 월간 정산 저장/업데이트
export async function saveMonthlySummary(
  yearMonth: string,
  comparison: MonthlyComparison,
  llmAnalysis?: string
): Promise<MonthlySummary | null> {
  const { current, previous } = comparison;

  const summaryData = {
    year_month: yearMonth,
    total_distance_km: current.totalDistance,
    total_duration_min: current.totalDuration,
    avg_pace: current.avgPace,
    avg_hr: current.avgHr,
    run_count: current.runCount,
    total_training_load: current.totalTrainingLoad,
    prev_total_distance_km: previous?.totalDistance || null,
    prev_total_duration_min: previous?.totalDuration || null,
    prev_avg_pace: previous?.avgPace || null,
    prev_avg_hr: previous?.avgHr || null,
    prev_run_count: previous?.runCount || null,
    prev_total_training_load: previous?.totalTrainingLoad || null,
    llm_analysis: llmAnalysis || null,
  };

  const { data, error } = await supabase
    .from('MonthlyRunningSummary')
    .upsert(summaryData, { onConflict: 'year_month' })
    .select()
    .single();

  if (error) {
    console.error('Error saving monthly summary:', error);
    return null;
  }

  return data;
}

// 최근 월간 정산 목록 가져오기
export async function getRecentMonthlySummaries(limit: number = 12): Promise<MonthlySummary[]> {
  const { data, error } = await supabase
    .from('MonthlyRunningSummary')
    .select('*')
    .order('year_month', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching monthly summaries:', error);
    return [];
  }

  return data || [];
}

// ============================================
// 일별 러닝 데이터 (그래프용)
// ============================================

export interface DailyRunning {
  date: string;
  day: number;
  distance_km: number;
}

// 월별 일별 러닝 데이터 조회 (라인 그래프용)
export async function getMonthlyDailyDistances(yearMonth: string): Promise<DailyRunning[]> {
  const { start, end } = getMonthDateRange(yearMonth);

  const { data, error } = await supabase
    .from('RunningLogs')
    .select('date, distance_km')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true });

  if (error || !data) {
    console.error('Error fetching daily distances:', error);
    return [];
  }

  return data.map((log) => ({
    date: log.date,
    day: parseInt(log.date.split('-')[2]),
    distance_km: log.distance_km || 0,
  }));
}

// ============================================
// 거리 마일스톤 (안양 기준)
// ============================================

export interface DistanceMilestone {
  from: string;
  to: string;
  note: string;
}

// ============================================
// HR Zone 분석 (8020 운동법)
// ============================================

export interface MonthlyZoneStats {
  totalTime: number;           // 총 운동 시간 (초)
  zone1Time: number;           // Zone1 시간 (초)
  zone2Time: number;           // Zone2 시간 (초)
  zone3Time: number;           // Zone3 시간 (초)
  zone4Time: number;           // Zone4 시간 (초)
  zone5Time: number;           // Zone5 시간 (초)
  zone2Percent: number;        // Zone2 비율 (%)
  zone3Percent: number;        // Zone3 비율 (%)
  lowIntensityPercent: number; // 저강도 (Zone1+2) 비율 (%)
  is8020Compliant: boolean;    // 80/20 준수 여부 (저강도 80% 이상)
  zone3Warning: boolean;       // Zone3 주의 필요 여부 (>20%)
}

// 월별 HR Zone 통계 계산
export async function getMonthlyZoneStats(yearMonth: string): Promise<MonthlyZoneStats> {
  const { start, end } = getMonthDateRange(yearMonth);

  const { data, error } = await supabase
    .from('RunningLogs')
    .select('hr_zone_times')
    .gte('date', start)
    .lte('date', end)
    .not('hr_zone_times', 'is', null);

  if (error || !data || data.length === 0) {
    return {
      totalTime: 0,
      zone1Time: 0,
      zone2Time: 0,
      zone3Time: 0,
      zone4Time: 0,
      zone5Time: 0,
      zone2Percent: 0,
      zone3Percent: 0,
      lowIntensityPercent: 0,
      is8020Compliant: false,
      zone3Warning: false,
    };
  }

  // hr_zone_times 배열: [Zone1, Zone2, Zone3, Zone4, Zone5, Zone6?, ???]
  let zone1Time = 0;
  let zone2Time = 0;
  let zone3Time = 0;
  let zone4Time = 0;
  let zone5Time = 0;

  for (const log of data) {
    const zones = log.hr_zone_times as number[];
    if (zones && zones.length >= 5) {
      zone1Time += zones[0] || 0;
      zone2Time += zones[1] || 0;
      zone3Time += zones[2] || 0;
      zone4Time += zones[3] || 0;
      zone5Time += zones[4] || 0;
    }
  }

  const totalTime = zone1Time + zone2Time + zone3Time + zone4Time + zone5Time;

  if (totalTime === 0) {
    return {
      totalTime: 0,
      zone1Time: 0,
      zone2Time: 0,
      zone3Time: 0,
      zone4Time: 0,
      zone5Time: 0,
      zone2Percent: 0,
      zone3Percent: 0,
      lowIntensityPercent: 0,
      is8020Compliant: false,
      zone3Warning: false,
    };
  }

  const zone2Percent = Math.round((zone2Time / totalTime) * 100);
  const zone3Percent = Math.round((zone3Time / totalTime) * 100);
  const lowIntensityPercent = Math.round(((zone1Time + zone2Time) / totalTime) * 100);

  return {
    totalTime,
    zone1Time,
    zone2Time,
    zone3Time,
    zone4Time,
    zone5Time,
    zone2Percent,
    zone3Percent,
    lowIntensityPercent,
    is8020Compliant: lowIntensityPercent >= 80,
    zone3Warning: zone3Percent >= 20,
  };
}

// ============================================
// 동적 인사이트 생성
// ============================================

export interface RunningInsight {
  text: string;
  size: number;
  color: string;
  type: 'positive' | 'warning' | 'neutral';
}

// 월간 데이터 기반 동적 인사이트 생성
export function generateMonthlyInsights(
  comparison: MonthlyComparison,
  zoneStats: MonthlyZoneStats
): RunningInsight[] {
  const insights: RunningInsight[] = [];
  const { current, changes } = comparison;

  // 8020 준수 여부
  if (zoneStats.totalTime > 0) {
    if (zoneStats.is8020Compliant) {
      insights.push({
        text: '8020 달성',
        size: 30,
        color: '#22c55e', // green
        type: 'positive',
      });
    } else {
      insights.push({
        text: '8020 운동법',
        size: 28,
        color: '#a3a3a3', // gray
        type: 'neutral',
      });
    }

    // Zone3 경고
    if (zoneStats.zone3Warning) {
      insights.push({
        text: `Zone3 ${zoneStats.zone3Percent}% 주의`,
        size: 30,
        color: '#f59e0b', // orange
        type: 'warning',
      });
    }
  }

  // 심박수 개선
  if (changes.hrChange !== null && changes.hrChange < -3) {
    insights.push({
      text: '심폐 기능 향상',
      size: 28,
      color: '#22c55e', // green
      type: 'positive',
    });
  }

  // 꾸준함 (주 3회 이상)
  const weeksInMonth = 4;
  const runsPerWeek = current.runCount / weeksInMonth;
  if (runsPerWeek >= 3) {
    insights.push({
      text: '꾸준한 러너',
      size: 24,
      color: '#a3a3a3', // gray
      type: 'neutral',
    });
  }

  // 거리 증가 + 페이스 유지/개선
  if (changes.distanceChange > 10 && changes.paceChange <= 0) {
    insights.push({
      text: '효율적인 훈련',
      size: 26,
      color: '#22c55e', // green
      type: 'positive',
    });
  }

  return insights;
}

// 거리 마일스톤 계산 (안양 기준)
export function getDistanceMilestone(distanceKm: number): DistanceMilestone {
  const milestones = [
    { min: 0, max: 5, from: '집', to: '동네 공원', note: '걸어서 10분' },
    { min: 5, max: 10, from: '안양', to: '과천', note: '약 8km' },
    { min: 10, max: 20, from: '안양', to: '사당', note: '약 15km' },
    { min: 20, max: 35, from: '안양', to: '강남', note: '약 25km' },
    { min: 35, max: 50, from: '안양', to: '잠실', note: '약 40km' },
    { min: 50, max: 70, from: '안양', to: '수원', note: '약 60km' },
    { min: 70, max: 100, from: '안양', to: '천안', note: '약 85km' },
    { min: 100, max: 150, from: '안양', to: '대전', note: '약 140km' },
    { min: 150, max: 250, from: '안양', to: '대구', note: '약 240km' },
    { min: 250, max: 400, from: '안양', to: '부산', note: '약 325km' },
    { min: 400, max: 600, from: '안양', to: '제주', note: '약 450km' },
  ];

  const milestone = milestones.find((m) => distanceKm >= m.min && distanceKm < m.max);
  return milestone
    ? { from: milestone.from, to: milestone.to, note: milestone.note }
    : { from: '안양', to: '세계일주', note: '600km+' };
}
