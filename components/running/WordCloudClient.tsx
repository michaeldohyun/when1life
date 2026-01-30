'use client';

import { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import MonthlyWordCloud, { WordItem, MonthlyWordCloudRef } from './MonthlyWordCloud';
import WordCloudActions from './WordCloudActions';
import WordCloudCustomizer, { CustomizerSettings, getBackgroundStyle } from './WordCloudCustomizer';

interface WordCloudClientProps {
  words: WordItem[];
  yearMonth: string;
  yearStr: string;
  monthName: string;
  previousMonth: string;
  nextMonth: string;
  colors: {
    white: string;
    green: string;
    red: string;
    blue: string;
    orange: string;
  };
}

const DEFAULT_SETTINGS: CustomizerSettings = {
  colors: {
    white: '#fafafa',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
    orange: '#f59e0b',
    muted: '#525252',
    background: '#0a0a0a',
  },
  backgroundImage: null,
  font: {
    family: 'system-ui, -apple-system, sans-serif',
    sizeMultiplier: 1,
  },
  layout: {
    spiral: 'archimedean',
    rotation: 'mixed',
    padding: 5,
  },
};

export default function WordCloudClient({
  words: initialWords,
  yearMonth,
  yearStr,
  monthName,
  previousMonth,
  nextMonth,
  colors: initialColors,
}: WordCloudClientProps) {
  const wordCloudRef = useRef<MonthlyWordCloudRef>(null);
  const [settings, setSettings] = useState<CustomizerSettings>(DEFAULT_SETTINGS);

  // 커스텀 색상과 크기가 적용된 words 배열 생성
  const customizedWords = useMemo(() => {
    const colorMap: Record<string, keyof typeof settings.colors> = {
      [initialColors.white]: 'white',
      [initialColors.green]: 'green',
      [initialColors.red]: 'red',
      [initialColors.blue]: 'blue',
      [initialColors.orange]: 'orange',
    };

    return initialWords.map(word => {
      let newColor = word.color;
      const colorKey = colorMap[word.color];
      if (colorKey && settings.colors[colorKey]) {
        newColor = settings.colors[colorKey];
      }
      // muted 색상 처리
      if (word.color === '#525252' || word.color === '#a3a3a3') {
        newColor = settings.colors.muted;
      }

      // 크기에 multiplier 적용
      const newSize = Math.round(word.size * settings.font.sizeMultiplier);

      return { ...word, color: newColor, size: newSize };
    });
  }, [initialWords, initialColors, settings.colors, settings.font.sizeMultiplier]);

  const backgroundStyle = getBackgroundStyle(settings.backgroundImage, settings.colors.background);

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/running/monthly"
              className="p-1.5 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-medium text-neutral-200">워드 콜라주</h1>
              <p className="text-xs text-neutral-500">{yearStr}년 {monthName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* 월 네비게이션 */}
            <Link
              href={`/running/monthly/wordcloud?month=${previousMonth}`}
              className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link
              href={`/running/monthly/wordcloud?month=${nextMonth}`}
              className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
            <div className="w-px h-4 bg-neutral-700 mx-1" />
            <WordCloudCustomizer
              settings={settings}
              onSettingsChange={setSettings}
            />
            <WordCloudActions
              wordCloudRef={wordCloudRef}
              title={`${yearStr}년 ${monthName} 러닝 정산`}
              yearMonth={yearMonth}
            />
          </div>
        </div>
      </div>

      {/* 워드 클라우드 */}
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl aspect-square rounded-2xl overflow-hidden" style={backgroundStyle}>
          <MonthlyWordCloud
            ref={wordCloudRef}
            words={customizedWords}
            backgroundColor={settings.colors.background}
            backgroundImage={settings.backgroundImage}
            fontFamily={settings.font.family}
            spiral={settings.layout.spiral}
            rotation={settings.layout.rotation}
            padding={settings.layout.padding}
          />
        </div>
      </div>
    </div>
  );
}
