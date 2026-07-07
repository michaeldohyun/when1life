'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, User } from 'lucide-react';
import type { PipelineStage } from '@/lib/work-data';

export function PipelineDemo({ stages }: { stages: PipelineStage[] }) {
  const [active, setActive] = useState(-1); // -1 = 시작 전
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (active >= stages.length - 1) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setActive((i) => i + 1), 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, active, stages.length]);

  const start = () => {
    setActive(0);
    setPlaying(true);
  };
  const reset = () => {
    setPlaying(false);
    setActive(-1);
  };

  const done = active >= stages.length - 1 && !playing;

  return (
    <div className="border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground tracking-wide">
          파이프라인 시뮬레이션
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={start}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            <Play className="w-3 h-3" />
            {active === -1 ? '재생' : '다시 재생'}
          </button>
          {active > -1 && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground border border-border transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              초기화
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-col gap-1">
          {stages.map((s, i) => {
            const state =
              i < active ? 'past' : i === active ? 'active' : 'future';
            return (
              <div key={s.label}>
                <button
                  onClick={() => {
                    setPlaying(false);
                    setActive(i);
                  }}
                  className={`w-full text-left border px-3 py-2 transition-colors ${
                    state === 'active'
                      ? s.human
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-foreground bg-muted/60 text-foreground'
                      : state === 'past'
                        ? 'border-border text-muted-foreground'
                        : 'border-dashed border-border text-muted-foreground/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tabular-nums opacity-70">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.human && <User className="w-3.5 h-3.5" />}
                    <span className="text-[13px] font-medium">{s.label}</span>
                    {s.human && (
                      <span
                        className={`text-[10px] ml-auto ${state === 'active' ? 'text-background/80' : 'text-muted-foreground'}`}
                      >
                        사람 개입 지점
                      </span>
                    )}
                  </div>
                  {state === 'active' && (
                    <p
                      className={`text-[12px] mt-1.5 leading-relaxed ${s.human ? 'text-background/90' : 'text-muted-foreground'}`}
                    >
                      {s.detail}
                    </p>
                  )}
                </button>
                {i < stages.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <span
                      className={`text-[10px] leading-none ${i < active ? 'text-foreground' : 'text-border'}`}
                    >
                      ↓
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground mt-3">
          {active === -1
            ? '재생을 누르거나 각 단계를 클릭해 보세요. 사람은 단 한 지점(승인)에서만 개입합니다.'
            : done
              ? '8단계 수작업이 이렇게 "발송 승인 1회"로 줄었습니다.'
              : '단계별로 시스템이 처리하는 내용을 보여줍니다.'}
        </p>
      </div>
    </div>
  );
}
