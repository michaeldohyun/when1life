import { AboutChatWidget } from '@/components/about/AboutChatWidget';
import { BUCKETS } from '@/lib/work-data';
import { getAllProjects } from '@/lib/work-db';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Michael (김도현)의 대표 작업 — BizOps 관점으로 구분한 포트폴리오.',
};

export default async function WorkPage() {
  const projects = await getAllProjects();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
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
      <p className="text-xs text-muted-foreground mb-12 leading-relaxed">
        사업에 필요한 일을 오너로 맡아 구조를 만들고 끝까지 책임진 작업들입니다.
        BizOps 관점의 6개 영역으로 나눴고, 각 카드를 열면 문제 → before/after →
        검증된 결과를 볼 수 있습니다.
      </p>

      <div className="space-y-12">
        {BUCKETS.map((bucket) => {
          const items = projects.filter((p) => p.bucket === bucket.key);
          if (items.length === 0) return null;
          return (
            <section key={bucket.key}>
              <div className="mb-4">
                <h2 className="text-sm font-medium text-foreground">{bucket.label}</h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {bucket.desc}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {items.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/work/${p.slug}`}
                    className="group border border-border p-4 hover:border-foreground transition-colors flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-foreground leading-snug">
                        {p.title}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed flex-1">
                      {p.oneLiner}
                    </p>
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-base font-semibold text-foreground">
                        {p.metric.value}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <AboutChatWidget />
    </div>
  );
}
