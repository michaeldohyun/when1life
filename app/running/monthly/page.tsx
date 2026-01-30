import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { getMonthlyComparison } from '@/lib/running';

export const dynamic = 'force-dynamic';

export default async function MonthlyRunningPage() {
  // 전월 기준
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const yearMonth = month === 0 ? `${year - 1}-12` : `${year}-${month.toString().padStart(2, '0')}`;

  const comparison = await getMonthlyComparison(yearMonth);
  const { current, changes } = comparison;

  const [yearStr, monthStr] = yearMonth.split('-');
  const monthName = `${yearStr}년 ${parseInt(monthStr)}월`;

  const formatChange = (value: number, suffix: string = '') => {
    if (value === 0) return '-';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}${suffix}`;
  };

  const designs = [
    {
      id: 'v4',
      name: '시안 D: 좌우분할 + 히트맵',
      description: 'B+C 조합, 사각형 히트맵 그리드',
      url: `/api/running/monthly/image/v4?month=${yearMonth}`,
    },
    {
      id: 'v5',
      name: '시안 E: 인포그래픽',
      description: '주간 바 차트 + 여정 시각화',
      url: `/api/running/monthly/image/v5?month=${yearMonth}`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/running"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-foreground">월간 러닝 리포트</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{monthName} 정산</p>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="border border-border p-6 mb-8">
        <h2 className="text-sm font-medium text-foreground mb-4">이번 달 요약</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-semibold text-foreground">{current.runCount}회</p>
            <p className="text-xs text-muted-foreground">러닝 횟수</p>
            <p className={`text-xs ${changes.runCountChange > 0 ? 'text-green-500' : changes.runCountChange < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {formatChange(changes.runCountChange, '회')} vs 전월
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{current.totalDistance}km</p>
            <p className="text-xs text-muted-foreground">총 거리</p>
            <p className={`text-xs ${changes.distanceChange > 0 ? 'text-green-500' : changes.distanceChange < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {formatChange(changes.distanceChange, '%')} vs 전월
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{current.avgPace}/km</p>
            <p className="text-xs text-muted-foreground">평균 페이스</p>
            <p className={`text-xs ${changes.paceChange < 0 ? 'text-green-500' : changes.paceChange > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {changes.paceChange !== 0 ? `${changes.paceChange < 0 ? '-' : '+'}${Math.abs(changes.paceChange)}초` : '-'} vs 전월
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{current.avgHr ? `${current.avgHr}` : '-'} bpm</p>
            <p className="text-xs text-muted-foreground">평균 심박수</p>
            <p className={`text-xs ${changes.hrChange !== null && changes.hrChange < 0 ? 'text-green-500' : changes.hrChange !== null && changes.hrChange > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {changes.hrChange !== null ? formatChange(changes.hrChange, ' bpm') : '-'} vs 전월
            </p>
          </div>
        </div>
      </div>

      {/* 디자인 시안 비교 */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-foreground mb-4">🎨 디자인 시안 비교</h2>
        <p className="text-xs text-muted-foreground mb-6">
          2가지 디자인 중 원하는 스타일을 선택해주세요. 각 이미지를 클릭하면 원본 크기로 볼 수 있습니다.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="border border-border">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">{design.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{design.description}</p>
              </div>
              <div className="p-4 bg-neutral-950">
                <a href={design.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={design.url}
                    alt={design.name}
                    className="w-full aspect-square object-contain hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </a>
              </div>
              <div className="p-3 flex justify-center">
                <a
                  href={design.url}
                  target="_blank"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="w-3 h-3" />
                  다운로드
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 텍스트 분석 (텔레그램용) */}
      <div className="border border-border p-6">
        <h2 className="text-sm font-medium text-foreground mb-3">📊 AI 분석 (텔레그램용)</h2>
        <div className="text-sm text-muted-foreground leading-relaxed">
          {changes.hrChange !== null && changes.hrChange < 0 ? (
            <p>
              심폐 기능이 눈에 띄게 향상되었습니다. 같은 페이스에서 심박수가 {Math.abs(changes.hrChange)}bpm
              낮아졌어요. 이는 심장이 더 효율적으로 일하고 있다는 신호입니다.
            </p>
          ) : (
            <p>심박수 데이터를 분석 중입니다.</p>
          )}
          <p className="mt-2">
            {changes.distanceChange > 0 && `거리가 ${changes.distanceChange}% 증가했고, `}
            {changes.runCountChange > 0
              ? `러닝 횟수도 ${changes.runCountChange}회 늘었습니다.`
              : '꾸준히 운동하고 있습니다.'}
          </p>
          <p className="mt-3 text-green-500">💡 다음 달 목표: 현재 페이스 유지하며 거리 늘리기</p>
        </div>
      </div>
    </div>
  );
}
