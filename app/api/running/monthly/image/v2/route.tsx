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

  // 월의 마지막 날 계산
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

  // 히트맵 데이터 생성 (일별 거리 → 색상 강도)
  const heatmapData = generateHeatmapData(dailyDistances, daysInMonth, parseInt(yearStr), parseInt(monthStr));
  const maxDistance = Math.max(...dailyDistances.map((d) => d.distance_km), 1);

  // 변화 포맷팅
  const formatChange = (value: number, suffix: string = '') => {
    if (value === 0) return '−';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}${suffix}`;
  };

  const formatPaceChange = (seconds: number) => {
    if (seconds === 0) return '−';
    const absSeconds = Math.abs(seconds);
    const sign = seconds < 0 ? '−' : '+';
    return `${sign}${absSeconds}s`;
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
          padding: 48,
          fontFamily: 'monospace',
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 28, color: '#fafafa', fontWeight: 500 }}>{monthName}</span>
          <span style={{ fontSize: 18, color: '#525252' }}>when1life</span>
        </div>

        {/* 구분선 */}
        <div style={{ display: 'flex', height: 1, backgroundColor: '#262626', marginBottom: 24 }} />

        {/* 메인 거리 + 마일스톤 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid #262626',
            padding: 32,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 64, color: '#fafafa', fontWeight: 600 }}>
            {current.totalDistance}
            <span style={{ fontSize: 24, color: '#737373', marginLeft: 8 }}>km</span>
          </span>
          <span style={{ fontSize: 20, color: '#a3a3a3', marginTop: 8 }}>
            {milestone.from} → {milestone.to}
          </span>
          <span
            style={{
              fontSize: 16,
              color: changes.distanceChange > 0 ? '#22c55e' : changes.distanceChange < 0 ? '#ef4444' : '#737373',
              marginTop: 12,
            }}
          >
            {formatChange(changes.distanceChange, '%')} vs 전월
          </span>
        </div>

        {/* 통계 3개 */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 20,
          }}
        >
          {/* 러닝 횟수 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              border: '1px solid #262626',
              padding: 20,
            }}
          >
            <span style={{ fontSize: 32, color: '#fafafa', fontWeight: 500 }}>{current.runCount}</span>
            <span style={{ fontSize: 14, color: '#737373', marginTop: 4 }}>runs</span>
            <span
              style={{
                fontSize: 14,
                color: changes.runCountChange > 0 ? '#22c55e' : changes.runCountChange < 0 ? '#ef4444' : '#737373',
                marginTop: 8,
              }}
            >
              {formatChange(changes.runCountChange)}
            </span>
          </div>

          {/* 페이스 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              border: '1px solid #262626',
              padding: 20,
            }}
          >
            <span style={{ fontSize: 32, color: '#fafafa', fontWeight: 500 }}>{current.avgPace}</span>
            <span style={{ fontSize: 14, color: '#737373', marginTop: 4 }}>/km</span>
            <span
              style={{
                fontSize: 14,
                color: changes.paceChange < 0 ? '#22c55e' : changes.paceChange > 0 ? '#ef4444' : '#737373',
                marginTop: 8,
              }}
            >
              {formatPaceChange(changes.paceChange)}
            </span>
          </div>

          {/* 심박수 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              border: '1px solid #262626',
              padding: 20,
            }}
          >
            <span style={{ fontSize: 32, color: '#fafafa', fontWeight: 500 }}>{current.avgHr || '−'}</span>
            <span style={{ fontSize: 14, color: '#737373', marginTop: 4 }}>bpm</span>
            <span
              style={{
                fontSize: 14,
                color:
                  changes.hrChange !== null
                    ? changes.hrChange < 0
                      ? '#22c55e'
                      : changes.hrChange > 0
                      ? '#ef4444'
                      : '#737373'
                    : '#737373',
                marginTop: 8,
              }}
            >
              {changes.hrChange !== null ? formatChange(changes.hrChange) : '−'}
            </span>
          </div>
        </div>

        {/* 히트맵 캘린더 (GitHub 잔디 스타일) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #262626',
            padding: 24,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#737373' }}>Daily Running</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#525252' }}>Less</span>
              <div style={{ display: 'flex', gap: 2 }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#1a1a1a', borderRadius: 2 }} />
                <div style={{ width: 12, height: 12, backgroundColor: '#0e4429', borderRadius: 2 }} />
                <div style={{ width: 12, height: 12, backgroundColor: '#006d32', borderRadius: 2 }} />
                <div style={{ width: 12, height: 12, backgroundColor: '#26a641', borderRadius: 2 }} />
                <div style={{ width: 12, height: 12, backgroundColor: '#39d353', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10, color: '#525252' }}>More</span>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div style={{ display: 'flex', marginBottom: 4, marginLeft: 24 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <span key={i} style={{ width: 120, fontSize: 10, color: '#525252', textAlign: 'center' }}>
                {day}
              </span>
            ))}
          </div>

          {/* 히트맵 그리드 (7열 x N행) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 20, fontSize: 10, color: '#525252' }}>
                  {weekIndex === 0 ? 'W1' : weekIndex === heatmapData.length - 1 ? `W${heatmapData.length}` : ''}
                </span>
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    style={{
                      width: 116,
                      height: 80,
                      backgroundColor: day.distance > 0 ? getHeatmapColor(day.distance, maxDistance) : '#1a1a1a',
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: day.day ? '1px solid #262626' : 'none',
                      opacity: day.day ? 1 : 0.3,
                    }}
                  >
                    {day.day && (
                      <>
                        <span style={{ fontSize: 12, color: '#737373' }}>{day.day}</span>
                        {day.distance > 0 && (
                          <span style={{ fontSize: 10, color: '#fafafa', marginTop: 2 }}>
                            {day.distance.toFixed(1)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ display: 'flex', height: 1, backgroundColor: '#262626', marginBottom: 20 }} />

        {/* AI 요약 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 14, color: '#737373', marginRight: 8 }}>💡</span>
          <span style={{ fontSize: 16, color: '#d4d4d4' }}>{summary}</span>
        </div>

        {/* 푸터 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 'auto',
            paddingTop: 20,
          }}
        >
          <span style={{ fontSize: 14, color: '#404040' }}>Running Coach · when1.life</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}

// 현재 연월 계산 (전월 기준)
function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month === 0) {
    return `${year - 1}-12`;
  }
  return `${year}-${month.toString().padStart(2, '0')}`;
}

// 히트맵 데이터 생성 (7열 캘린더 형태)
function generateHeatmapData(
  dailyData: Array<{ day: number; distance_km: number }>,
  daysInMonth: number,
  year: number,
  month: number
): Array<Array<{ day: number | null; distance: number }>> {
  // 해당 월 1일의 요일 (0: 일요일)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const weeks: Array<Array<{ day: number | null; distance: number }>> = [];
  let currentWeek: Array<{ day: number | null; distance: number }> = [];

  // 첫 주 앞의 빈 칸
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ day: null, distance: 0 });
  }

  // 실제 날짜 데이터
  const distanceMap = new Map(dailyData.map((d) => [d.day, d.distance_km]));

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push({
      day,
      distance: distanceMap.get(day) || 0,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // 마지막 주 뒤의 빈 칸
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ day: null, distance: 0 });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

// 히트맵 색상 계산 (GitHub 잔디 스타일)
function getHeatmapColor(distance: number, maxDistance: number): string {
  const intensity = distance / maxDistance;

  if (intensity === 0) return '#1a1a1a';
  if (intensity < 0.25) return '#0e4429';
  if (intensity < 0.5) return '#006d32';
  if (intensity < 0.75) return '#26a641';
  return '#39d353';
}
