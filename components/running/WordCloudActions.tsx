'use client';

import { Share2, Download, Check, Copy } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { MonthlyWordCloudRef } from './MonthlyWordCloud';

interface WordCloudActionsProps {
  wordCloudRef: React.RefObject<MonthlyWordCloudRef | null>;
  title: string;
  yearMonth: string;
}

export default function WordCloudActions({
  wordCloudRef,
  title,
  yearMonth,
}: WordCloudActionsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // 공유 기능
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/running/monthly/wordcloud?month=${yearMonth}`;
    const shareData = {
      title: `${title} | when1.life`,
      text: `${title} - 월간 러닝 정산`,
      url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Web Share API 미지원 시 클립보드 복사
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // 사용자가 공유 취소하거나 오류 발생 시
      if ((error as Error).name !== 'AbortError') {
        // 클립보드 복사 폴백
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          console.error('복사 실패');
        }
      }
    }
  }, [title, yearMonth]);

  // 다운로드 기능 (SVG → PNG)
  const handleDownload = useCallback(async () => {
    const svg = wordCloudRef.current?.getSvgElement();
    if (!svg) return;

    setDownloading(true);

    try {
      // SVG를 문자열로 변환
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Canvas에 SVG 그리기
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 고해상도 (2배)
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        if (ctx) {
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
        }

        // PNG로 다운로드
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `running-${yearMonth}.png`;
        link.href = pngUrl;
        link.click();

        // 정리
        URL.revokeObjectURL(svgUrl);
        setDownloading(false);
      };

      img.onerror = () => {
        console.error('이미지 로드 실패');
        URL.revokeObjectURL(svgUrl);
        setDownloading(false);
      };

      img.src = svgUrl;
    } catch (error) {
      console.error('다운로드 실패:', error);
      setDownloading(false);
    }
  }, [wordCloudRef, yearMonth]);

  return (
    <>
      <button
        onClick={handleShare}
        className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
        title={copied ? '복사됨!' : '공유'}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-50"
        title="다운로드"
      >
        <Download className={`w-4 h-4 ${downloading ? 'animate-pulse' : ''}`} />
      </button>
    </>
  );
}
