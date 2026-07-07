import { AboutChatWidget } from '@/components/about/AboutChatWidget';
import { getCases } from '@/lib/content-db';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Michael (김도현)의 케이스 스터디 — 임팩트와 러닝 포인트 중심으로 정리한 대표 프로젝트.',
};

export const dynamic = 'force-dynamic';

export default async function WorkPage() {
  const cases = await getCases();
  return (
    <div className="mx-auto max-w-[52rem] px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-medium text-foreground">Work</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-10 leading-relaxed max-w-xl">
        일의 나열이 아니라, 임팩트와 러닝 포인트 기준으로 정리한 케이스입니다.
        각 케이스는 상황 → 판단 → 실행 → 검증된 결과 → 배운 것 순서로 읽힙니다.
      </p>

      <div className="space-y-6">
        {cases.map((c, i) => (
          <Link
            key={c.slug}
            href={`/work/${c.slug}`}
            className="group block border border-border p-6 sm:p-7 hover:border-foreground transition-colors"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-[11px] font-mono text-muted-foreground tracking-wide">
                CASE {String(i + 1).padStart(2, '0')} · {c.period}
              </span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-foreground leading-snug">
              {c.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">
              {c.oneLiner}
            </p>

            {/* 임팩트 티저 */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5">
              {c.impact.slice(0, 3).map((m) => (
                <div key={m.value}>
                  <p className="text-base font-mono font-semibold text-foreground tracking-tight">
                    {m.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[180px]">
                    {m.caption}
                  </p>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        케이스를 구성한 개별 시스템의 상세(before/after·검증)는 각 케이스 안에서
        이어집니다.
      </p>

      <AboutChatWidget />
    </div>
  );
}
