import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getMonthlyComparison, getMonthlyDailyDistances, getDistanceMilestone } from '@/lib/running';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearMonth = searchParams.get('month') || getCurrentYearMonth();
  const aiSummary = searchParams.get('summary') || '';

  const [comparison, dailyDistances] = await Promise.all([
    getMonthlyComparison(yearMonth),
    getMonthlyDailyDistances(yearMonth),
  ]);

  const { current, changes } = comparison;
  const milestone = getDistanceMilestone(current.totalDistance);

  const [yearStr, monthStr] = yearMonth.split('-');
  const monthName = `${yearStr}년 ${parseInt(monthStr)}월`;
  const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();

  // 기본 AI 요약
  const defaultSummary = (() => {
    if (changes.hrChange !== null && changes.hrChange < 0) {
      return `심박수 ${Math.abs(changes.hrChange)}bpm ↓ 심폐 기능 향상`;
    }
    if (changes.distanceChange > 10) {
      return `거리 ${changes.distanceChange}% 증가, 좋은 페이스`;
    }
    if (changes.runCountChange > 0) {
      return `러닝 횟수 증가, 꾸준한 훈련 중`;
    }
    return '꾸준히 달리고 있습니다';
  })();

  const summary = aiSummary || defaultSummary;

  // 히트맵 데이터
  const heatmapCells = generateHeatmapCells(dailyDistances, daysInMonth);
  const maxDistance = Math.max(...dailyDistances.map((d) => d.distance_km), 1);

  // 운동장 바퀴 계산 (400m 트랙 기준)
  const trackLaps = Math.round((current.totalDistance * 1000) / 400);

  // 변화 아이콘
  const getChangeIcon = (value: number, inverse: boolean = false) => {
    if (value === 0) return '→';
    const isPositive = inverse ? value < 0 : value > 0;
    return isPositive ? '↑' : '↓';
  };

  const getChangeColor = (value: number, inverse: boolean = false) => {
    if (value === 0) return '#525252';
    const isPositive = inverse ? value < 0 : value > 0;
    return isPositive ? '#22c55e' : '#ef4444';
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          fontFamily: 'monospace',
          padding: 56,
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 36, color: '#fafafa', fontWeight: 700 }}>{monthName}</span>
          <span style={{ fontSize: 16, color: '#525252' }}>when1life</span>
        </div>

        {/* 메인 스탯: 거리 (크게) */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 48 }}>
          <span style={{ fontSize: 140, color: '#fafafa', fontWeight: 800, lineHeight: 1 }}>
            {current.totalDistance}
          </span>
          <span style={{ fontSize: 48, color: '#525252', marginLeft: 12 }}>km</span>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 24 }}>
            <span style={{ fontSize: 32, color: getChangeColor(changes.distanceChange) }}>
              {getChangeIcon(changes.distanceChange)} {Math.abs(changes.distanceChange)}%
            </span>
          </div>
        </div>

        {/* 3개 서브 스탯 (가로 배치) */}
        <div style={{ display: 'flex', gap: 48, marginBottom: 56 }}>
          {/* 러닝 횟수 */}
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 64, color: '#fafafa', fontWeight: 700 }}>{current.runCount}</span>
            <span style={{ fontSize: 20, color: '#525252', marginLeft: 8 }}>runs</span>
            <span style={{ fontSize: 24, color: getChangeColor(changes.runCountChange), marginLeft: 12 }}>
              {getChangeIcon(changes.runCountChange)} {Math.abs(changes.runCountChange)}
            </span>
          </div>

          {/* 페이스 */}
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 64, color: '#fafafa', fontWeight: 700 }}>{current.avgPace}</span>
            <span style={{ fontSize: 20, color: '#525252', marginLeft: 8 }}>/km</span>
            <span style={{ fontSize: 24, color: getChangeColor(changes.paceChange, true), marginLeft: 12 }}>
              {getChangeIcon(changes.paceChange, true)} {Math.abs(changes.paceChange)}s
            </span>
          </div>

          {/* 심박수 */}
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 64, color: '#fafafa', fontWeight: 700 }}>{current.avgHr || '−'}</span>
            <span style={{ fontSize: 20, color: '#525252', marginLeft: 8 }}>bpm</span>
            {changes.hrChange !== null && (
              <span style={{ fontSize: 24, color: getChangeColor(changes.hrChange, true), marginLeft: 12 }}>
                {getChangeIcon(changes.hrChange, true)} {Math.abs(changes.hrChange)}
              </span>
            )}
          </div>
        </div>

        {/* AI 인사이트 */}
        <div style={{ display: 'flex', marginBottom: 40 }}>
          <span style={{ fontSize: 22, color: '#a3a3a3', lineHeight: 1.4 }}>💡 {summary}</span>
        </div>

        {/* 구분선 */}
        <div style={{ display: 'flex', width: '100%', height: 1, backgroundColor: '#262626', marginBottom: 40 }} />

        {/* 히트맵 */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#525252' }}>Daily Activity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#404040' }}>Less</span>
              <div style={{ display: 'flex', gap: 3 }}>
                <div style={{ width: 14, height: 14, backgroundColor: '#1a1a1a', borderRadius: 3 }} />
                <div style={{ width: 14, height: 14, backgroundColor: '#0e4429', borderRadius: 3 }} />
                <div style={{ width: 14, height: 14, backgroundColor: '#006d32', borderRadius: 3 }} />
                <div style={{ width: 14, height: 14, backgroundColor: '#26a641', borderRadius: 3 }} />
                <div style={{ width: 14, height: 14, backgroundColor: '#39d353', borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 11, color: '#404040' }}>More</span>
            </div>
          </div>

          {/* 히트맵 그리드 */}
          <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
            {heatmapCells.map((cell, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: getHeatmapColor(cell.distance, maxDistance),
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
        </div>

        {/* TAGS callout */}
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ fontSize: 24, color: '#22c55e', fontWeight: 600 }}>#{milestone.from}에서{milestone.to}까지</span>
          <span style={{ fontSize: 24, color: '#3b82f6', fontWeight: 600 }}>#안양종합운동장{trackLaps}바퀴</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}

function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month === 0) {
    return `${year - 1}-12`;
  }
  return `${year}-${month.toString().padStart(2, '0')}`;
}

// 히트맵 셀 생성
function generateHeatmapCells(
  dailyData: Array<{ day: number; distance_km: number }>,
  daysInMonth: number
): Array<{ day: number; distance: number }> {
  const distanceMap = new Map(dailyData.map((d) => [d.day, d.distance_km]));
  const cells: Array<{ day: number; distance: number }> = [];

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      distance: distanceMap.get(day) || 0,
    });
  }

  return cells;
}

function getHeatmapColor(distance: number, maxDistance: number): string {
  if (distance === 0) return '#1a1a1a';
  const intensity = distance / maxDistance;
  if (intensity < 0.25) return '#0e4429';
  if (intensity < 0.5) return '#006d32';
  if (intensity < 0.75) return '#26a641';
  return '#39d353';
}
