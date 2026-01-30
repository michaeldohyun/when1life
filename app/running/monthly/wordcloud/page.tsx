import { Metadata } from 'next';
import { getMonthlyComparison, getDistanceMilestone, getMonthlyZoneStats, generateMonthlyInsights } from '@/lib/running';
import { WordItem } from '@/components/running/MonthlyWordCloud';
import WordCloudClient from '@/components/running/WordCloudClient';

export const dynamic = 'force-dynamic';

function getDefaultYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month === 0) {
    return `${year - 1}-12`;
  }
  return `${year}-${month.toString().padStart(2, '0')}`;
}

function getPreviousMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  if (month === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${(month - 1).toString().padStart(2, '0')}`;
}

function getNextMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  if (month === 12) {
    return `${year + 1}-01`;
  }
  return `${year}-${(month + 1).toString().padStart(2, '0')}`;
}

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

// OG 메타데이터 생성
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const yearMonth = params.month || getDefaultYearMonth();
  const [yearStr, monthStr] = yearMonth.split('-');
  const monthName = `${parseInt(monthStr)}월`;

  return {
    title: `${yearStr}년 ${monthName} 러닝 정산`,
    description: `${yearStr}년 ${monthName} 월간 러닝 기록을 워드클라우드로 시각화합니다.`,
    openGraph: {
      title: `${yearStr}년 ${monthName} 러닝 정산 | when1.life`,
      description: `${yearStr}년 ${monthName} 월간 러닝 기록을 워드클라우드로 시각화합니다.`,
      images: [`/api/running/monthly/image/v5?month=${yearMonth}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${yearStr}년 ${monthName} 러닝 정산 | when1.life`,
      description: `${yearStr}년 ${monthName} 월간 러닝 기록을 워드클라우드로 시각화합니다.`,
      images: [`/api/running/monthly/image/v5?month=${yearMonth}`],
    },
  };
}

export default async function WordCloudPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const yearMonth = params.month || getDefaultYearMonth();
  const comparison = await getMonthlyComparison(yearMonth);
  const { current, changes } = comparison;
  const milestone = getDistanceMilestone(current.totalDistance);
  const trackLaps = Math.round((current.totalDistance * 1000) / 400);
  const zoneStats = await getMonthlyZoneStats(yearMonth);
  const insights = generateMonthlyInsights(comparison, zoneStats);

  const [yearStr, monthStr] = yearMonth.split('-');
  const monthName = `${parseInt(monthStr)}월`;

  // 색상 팔레트
  const colors = {
    white: '#fafafa',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
    orange: '#f59e0b',
    gray: '#a3a3a3',
    muted: '#525252',
  };

  // 변화에 따른 색상
  const getChangeColor = (value: number, inverse: boolean = false) => {
    if (value === 0) return colors.muted;
    const isPositive = inverse ? value < 0 : value > 0;
    return isPositive ? colors.green : colors.red;
  };

  // 워드 클라우드 데이터 생성
  const words: WordItem[] = [
    // 제목
    { text: `${monthName} 러닝 정산`, size: 32, color: colors.muted },

    // 러닝 횟수 (총 N회)
    { text: `총 ${current.runCount}회`, size: 75, color: colors.white },
    {
      text: changes.runCountChange >= 0
        ? `횟수 전월 대비 ${changes.runCountChange}회 증가`
        : `횟수 전월 대비 ${Math.abs(changes.runCountChange)}회 감소`,
      size: 24,
      color: getChangeColor(changes.runCountChange)
    },

    // 총 거리
    { text: `총 ${current.totalDistance}km`, size: 85, color: colors.white },
    {
      text: changes.distanceChange >= 0
        ? `거리 전월 대비 ${changes.distanceChange}% 증가`
        : `거리 전월 대비 ${Math.abs(changes.distanceChange)}% 감소`,
      size: 24,
      color: getChangeColor(changes.distanceChange)
    },

    // 마일스톤
    { text: `${milestone.from}에서 ${milestone.to}까지`, size: 38, color: colors.blue },
    { text: `안양종합운동장 ${trackLaps}바퀴`, size: 34, color: colors.blue },

    // 페이스 (평균 페이스 통합)
    { text: `평균 페이스 ${current.avgPace}`, size: 60, color: colors.white },
    {
      text: changes.paceChange <= 0
        ? `페이스 전월 대비 ${Math.abs(changes.paceChange)}초 빨라짐`
        : `페이스 전월 대비 ${changes.paceChange}초 느려짐`,
      size: 24,
      color: getChangeColor(changes.paceChange, true)
    },

    // 심박수 (평균 심박수)
    ...(current.avgHr ? [
      { text: `평균 심박수 ${current.avgHr}bpm`, size: 55, color: colors.white },
      ...(changes.hrChange !== null ? [{
        text: changes.hrChange <= 0
          ? `심박수 전월 대비 ${Math.abs(changes.hrChange)}bpm 감소`
          : `심박수 전월 대비 ${changes.hrChange}bpm 증가`,
        size: 24,
        color: getChangeColor(changes.hrChange, true)
      }] : [])
    ] : []),

    // 동적 인사이트 (실제 데이터 기반)
    ...insights.map(insight => ({
      text: insight.text,
      size: insight.size,
      color: insight.color,
    })),
  ];

  return (
    <WordCloudClient
      words={words}
      yearMonth={yearMonth}
      yearStr={yearStr}
      monthName={monthName}
      previousMonth={getPreviousMonth(yearMonth)}
      nextMonth={getNextMonth(yearMonth)}
      colors={colors}
    />
  );
}
