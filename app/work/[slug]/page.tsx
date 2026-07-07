import { AboutChatWidget } from '@/components/about/AboutChatWidget';
import { PipelineDemo } from '@/components/work/PipelineDemo';
import { BUCKETS } from '@/lib/work-data';
import { getProjectBySlug } from '@/lib/work-db';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return { title: 'Work' };
  return { title: p.title, description: p.oneLiner };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) notFound();

  const bucket = BUCKETS.find((b) => b.key === p.bucket);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/work"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs text-muted-foreground">{bucket?.label}</span>
      </div>

      {/* Title */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {p.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-[10px] text-muted-foreground border border-border"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-medium text-foreground">{p.title}</h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{p.problem}</p>
      </div>

      {/* 인터랙티브 데모 (있으면) */}
      {p.demo?.type === 'pipeline' && (
        <div className="mb-10">
          <PipelineDemo stages={p.demo.stages} />
        </div>
      )}

      {/* Before → After */}
      {p.comparison.length > 0 && (
        <div className="border border-border mb-8">
          <div className="grid grid-cols-[minmax(64px,auto)_1fr_1fr] items-center gap-x-3 px-5 pt-4 pb-2 border-b border-border">
            <span />
            <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
              BEFORE
            </span>
            <span className="text-[11px] font-medium text-foreground tracking-wide flex items-center gap-1">
              <ArrowRight className="w-3 h-3" />
              AFTER
            </span>
          </div>
          <div className="divide-y divide-border px-5">
            {p.comparison.map((row) => (
              <div
                key={row.axis}
                className="grid grid-cols-[minmax(64px,auto)_1fr_1fr] items-center gap-x-3 py-3"
              >
                <span className="text-[11px] text-muted-foreground">{row.axis}</span>
                <span className="text-[13px] text-muted-foreground line-through decoration-border">
                  {row.before}
                </span>
                <span className="text-[13px] text-foreground font-medium">{row.after}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 핵심 숫자 + how */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-4 flex-wrap">
          <span className="text-3xl font-semibold text-foreground">{p.metric.value}</span>
          <span className="text-xs text-muted-foreground">{p.metric.caption}</span>
        </div>
        {p.how && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">어떻게 </span>
            {p.how}
          </p>
        )}
      </div>

      {/* 증거 + 기술 */}
      <div className="border-t border-border pt-6 space-y-5">
        {p.evidence.length > 0 && (
          <div>
            <p className="text-[11px] text-muted-foreground mb-2">검증 · 증거</p>
            <div className="flex flex-wrap gap-1.5">
              {p.evidence.map((t) => (
                <span key={t} className="px-2 py-0.5 text-[11px] text-foreground border border-border">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        {p.tech.length > 0 && (
          <div>
            <p className="text-[11px] text-muted-foreground mb-2">기술</p>
            <div className="flex flex-wrap gap-1.5">
              {p.tech.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[11px] text-muted-foreground border border-border"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        {p.note && (
          <p className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
            ※ {p.note}
          </p>
        )}
      </div>

      <AboutChatWidget />
    </div>
  );
}
