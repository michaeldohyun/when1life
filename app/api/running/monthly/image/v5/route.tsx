import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getMonthlyComparison, getDistanceMilestone } from '@/lib/running';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearMonth = searchParams.get('month') || getCurrentYearMonth();

  const comparison = await getMonthlyComparison(yearMonth);
  const { current, changes } = comparison;
  const milestone = getDistanceMilestone(current.totalDistance);

  const [yearStr, monthStr] = yearMonth.split('-');
  const monthName = `${yearStr}년 ${parseInt(monthStr)}월`;

  // 운동장 바퀴 계산 (400m 트랙 기준)
  const trackLaps = Math.round((current.totalDistance * 1000) / 400);

  // 색상 정의
  const colors = {
    white: '#fafafa',
    gray: '#a3a3a3',
    muted: '#525252',
    positive: '#22c55e',
    negative: '#ef4444',
    warning: '#f59e0b',
    accent: '#3b82f6',
  };

  // 변화에 따른 색상
  const getChangeColor = (value: number, inverse: boolean = false) => {
    if (value === 0) return colors.muted;
    const isPositive = inverse ? value < 0 : value > 0;
    return isPositive ? colors.positive : colors.negative;
  };

  // 텍스트 생성
  const runCountChangeText = changes.runCountChange >= 0
    ? `지난달보다 ${Math.abs(changes.runCountChange)}번 더 뜀`
    : `지난달보다 ${Math.abs(changes.runCountChange)}번 덜 뜀`;

  const distanceChangeText = changes.distanceChange >= 0
    ? `${Math.abs(changes.distanceChange)}% 더 달림`
    : `${Math.abs(changes.distanceChange)}% 덜 달림`;

  const paceChangeText = changes.paceChange <= 0
    ? `${Math.abs(changes.paceChange)}초 빨라짐`
    : `${Math.abs(changes.paceChange)}초 느려짐`;

  const hrChangeText = changes.hrChange !== null
    ? (changes.hrChange <= 0
        ? `${Math.abs(changes.hrChange)}bpm 낮아짐`
        : `${Math.abs(changes.hrChange)}bpm 높아짐`)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          padding: 72,
        }}
      >
        {/* 제목 */}
        <div style={{ display: 'flex', marginBottom: 56 }}>
          <span style={{ fontSize: 36, color: colors.muted, fontWeight: 500 }}>
            {monthName} 러닝 정산
          </span>
        </div>

        {/* 워드 콜라주 영역 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 28,
          }}
        >
          {/* 러닝 횟수 */}
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 32, color: colors.gray }}>총</span>
            <span style={{ fontSize: 80, color: colors.white, fontWeight: 800 }}>{current.runCount}회</span>
            <span style={{ fontSize: 32, color: colors.gray }}>뜀,</span>
            <span style={{ fontSize: 28, color: getChangeColor(changes.runCountChange) }}>
              {runCountChangeText}
            </span>
          </div>

          {/* 거리 */}
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 32, color: colors.gray }}>거리는</span>
            <span style={{ fontSize: 100, color: colors.white, fontWeight: 800 }}>{current.totalDistance}km</span>
            <span style={{ fontSize: 28, color: getChangeColor(changes.distanceChange) }}>
              {distanceChangeText}
            </span>
          </div>

          {/* 마일스톤 */}
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontSize: 40, color: colors.accent, fontWeight: 600 }}>
              {milestone.from}에서 {milestone.to}까지
            </span>
            <span style={{ fontSize: 28, color: colors.muted }}>거리,</span>
            <span style={{ fontSize: 40, color: colors.accent, fontWeight: 600 }}>
              운동장 {trackLaps}바퀴
            </span>
          </div>

          {/* 페이스 */}
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
            <span style={{ fontSize: 32, color: colors.gray }}>평균 페이스</span>
            <span style={{ fontSize: 72, color: colors.white, fontWeight: 700 }}>{current.avgPace}</span>
            <span style={{ fontSize: 28, color: colors.muted }}>/km,</span>
            <span style={{ fontSize: 28, color: getChangeColor(changes.paceChange, true) }}>
              {paceChangeText}
            </span>
          </div>

          {/* 심박수 */}
          {current.avgHr && (
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 32, color: colors.gray }}>평균 심박수</span>
              <span style={{ fontSize: 72, color: colors.white, fontWeight: 700 }}>{current.avgHr}</span>
              <span style={{ fontSize: 28, color: colors.muted }}>bpm,</span>
              {hrChangeText && (
                <span style={{ fontSize: 28, color: getChangeColor(changes.hrChange!, true) }}>
                  {hrChangeText}
                </span>
              )}
            </div>
          )}

          {/* 8020 분석 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 26, color: colors.gray }}>
                설정한 8020 운동법에 맞게 뛴 경우도 있지만,
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 32, color: colors.warning, fontWeight: 600 }}>
                간혹 Zone3 구간이 40% 이상
              </span>
              <span style={{ fontSize: 26, color: colors.gray }}>
                으로 주의 필요
              </span>
            </div>
          </div>
        </div>

        {/* 하단 브랜딩 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
          <span style={{ fontSize: 18, color: colors.muted }}>when1.life</span>
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
