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

  // SVG 차트 포인트 생성
  const chartWidth = 920;
  const chartHeight = 140;
  const chartPoints = generateChartPoints(dailyDistances, chartWidth, chartHeight, daysInMonth);
  const chartCircles = generateChartCircles(dailyDistances, chartWidth, chartHeight, daysInMonth);

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

  // 등고선 패턴 생성
  const topoLines = generateTopoLines();

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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 등고선 배경 텍스처 */}
        <svg
          width="1080"
          height="1080"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.15,
          }}
        >
          {topoLines.map((line, i) => (
            <path
              key={i}
              d={line}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
            />
          ))}
        </svg>
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

        {/* 일별 러닝 그래프 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #262626',
            padding: 20,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 14, color: '#737373', marginBottom: 16 }}>Daily Running</span>

          {dailyDistances.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* SVG 차트 */}
              <svg width={chartWidth} height={chartHeight} style={{ display: 'flex' }}>
                {/* 그리드 라인 */}
                <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#262626" strokeWidth="1" />
                <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#262626" strokeWidth="1" />
                <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#262626" strokeWidth="1" />

                {/* 라인 차트 */}
                {chartPoints && (
                  <polyline points={chartPoints} fill="none" stroke="#fafafa" strokeWidth="2" strokeLinejoin="round" />
                )}

                {/* 데이터 포인트 */}
                {chartCircles.map((circle, i) => (
                  <circle key={i} cx={circle.x} cy={circle.y} r="4" fill="#fafafa" />
                ))}
              </svg>

              {/* X축 레이블 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#525252' }}>1</span>
                <span style={{ fontSize: 12, color: '#525252' }}>10</span>
                <span style={{ fontSize: 12, color: '#525252' }}>20</span>
                <span style={{ fontSize: 12, color: '#525252' }}>{daysInMonth}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: chartHeight }}>
              <span style={{ fontSize: 14, color: '#525252' }}>러닝 기록 없음</span>
            </div>
          )}
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

// SVG polyline 포인트 생성
function generateChartPoints(
  dailyData: Array<{ day: number; distance_km: number }>,
  chartWidth: number,
  chartHeight: number,
  daysInMonth: number
): string {
  if (dailyData.length === 0) return '';

  const maxDistance = Math.max(...dailyData.map((d) => d.distance_km), 1);
  const padding = 10;
  const effectiveWidth = chartWidth - padding * 2;
  const effectiveHeight = chartHeight - padding * 2;

  return dailyData
    .map((d) => {
      const x = padding + ((d.day - 1) / (daysInMonth - 1)) * effectiveWidth;
      const y = padding + effectiveHeight - (d.distance_km / maxDistance) * effectiveHeight;
      return `${x},${y}`;
    })
    .join(' ');
}

// SVG circle 좌표 생성
function generateChartCircles(
  dailyData: Array<{ day: number; distance_km: number }>,
  chartWidth: number,
  chartHeight: number,
  daysInMonth: number
): Array<{ x: number; y: number }> {
  if (dailyData.length === 0) return [];

  const maxDistance = Math.max(...dailyData.map((d) => d.distance_km), 1);
  const padding = 10;
  const effectiveWidth = chartWidth - padding * 2;
  const effectiveHeight = chartHeight - padding * 2;

  return dailyData.map((d) => ({
    x: padding + ((d.day - 1) / (daysInMonth - 1)) * effectiveWidth,
    y: padding + effectiveHeight - (d.distance_km / maxDistance) * effectiveHeight,
  }));
}

// 등고선 패턴 생성
function generateTopoLines(): string[] {
  const lines: string[] = [];
  const centerX = 540;
  const centerY = 540;

  // 동심원 형태의 등고선 (불규칙하게)
  for (let i = 1; i <= 12; i++) {
    const baseRadius = i * 80;
    const points: string[] = [];

    for (let angle = 0; angle <= 360; angle += 5) {
      const rad = (angle * Math.PI) / 180;
      // 불규칙한 변형 추가
      const variation = Math.sin(angle * 0.1) * 30 + Math.cos(angle * 0.15) * 20;
      const radius = baseRadius + variation + Math.sin(i * 0.5 + angle * 0.05) * 15;
      const x = centerX + Math.cos(rad) * radius;
      const y = centerY + Math.sin(rad) * radius;

      if (angle === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        points.push(`L ${x} ${y}`);
      }
    }
    points.push('Z');
    lines.push(points.join(' '));
  }

  // 추가 곡선 라인들 (대각선 방향)
  for (let i = 0; i < 8; i++) {
    const startX = -100 + i * 180;
    const points: string[] = [`M ${startX} 0`];

    for (let y = 0; y <= 1080; y += 30) {
      const wave = Math.sin(y * 0.01 + i * 0.5) * 40 + Math.cos(y * 0.02) * 20;
      points.push(`L ${startX + wave + y * 0.3} ${y}`);
    }
    lines.push(points.join(' '));
  }

  return lines;
}
