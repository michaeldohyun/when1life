import { AboutChatWidget } from '@/components/about/AboutChatWidget';
import { PipelineDemo } from '@/components/work/PipelineDemo';
import { BUCKETS, DEMOS } from '@/lib/work-data';
import { getAllProjects, getProjectBySlug } from '@/lib/work-db';
import { type CaseStudy } from '@/lib/case-data';
import { getCaseBySlug } from '@/lib/content-db';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
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
  const c = await getCaseBySlug(slug);
  if (c) return { title: c.title, description: c.oneLiner };
  const p = await getProjectBySlug(slug);
  if (!p) return { title: 'Work' };
  return { title: p.title, description: p.oneLiner };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-mono text-muted-foreground tracking-widest mb-3">
      {children}
    </p>
  );
}

async function CaseView({ c }: { c: CaseStudy }) {
  const all = c.systemSlugs ? await getAllProjects() : [];
  const systems = (c.systemSlugs ?? [])
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const demo = c.demoSlug ? DEMOS[c.demoSlug] : undefined;

  return (
    <div className="mx-auto max-w-[52rem] px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/work"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-[11px] font-mono text-muted-foreground tracking-wide">
          CASE STUDY · {c.period}
        </span>
      </div>

      {/* Title */}
      <div className="mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground leading-snug">
          {c.title}
        </h1>
        <p className="text-[15px] text-muted-foreground mt-4 leading-relaxed max-w-xl">
          {c.oneLiner}
        </p>
        <p className="text-xs text-muted-foreground mt-3">{c.role}</p>
      </div>

      {/* 상황 */}
      <section className="mb-10">
        <SectionLabel>상황</SectionLabel>
        <p className="text-[15px] text-foreground leading-relaxed max-w-2xl">{c.context}</p>
      </section>

      {/* 문제 재정의 */}
      <section className="mb-12">
        <SectionLabel>문제 재정의</SectionLabel>
        <p className="text-[15px] text-foreground leading-relaxed max-w-2xl border-l-2 border-foreground pl-4">
          {c.reframe}
        </p>
      </section>

      {/* 접근 — 의사결정 */}
      <section className="mb-12">
        <SectionLabel>접근 — 핵심 의사결정</SectionLabel>
        <div className="space-y-5">
          {c.decisions.map((d, i) => (
            <div key={d.title} className="flex gap-4">
              <span className="text-sm font-mono text-muted-foreground pt-0.5 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-[15px] font-medium text-foreground">{d.title}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xl">
                  {d.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 데모 */}
      {demo && (
        <section className="mb-12">
          <SectionLabel>어떻게 동작하나 — 라이브 시뮬레이션</SectionLabel>
          <PipelineDemo stages={demo.stages} />
        </section>
      )}

      {/* 임팩트 */}
      <section className="mb-12">
        <SectionLabel>검증된 임팩트</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 border border-border divide-x divide-y divide-border">
          {c.impact.map((m) => (
            <div key={m.value} className="px-4 py-5">
              <p className="text-xl font-mono font-semibold text-foreground tracking-tight">
                {m.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                {m.caption}
              </p>
            </div>
          ))}
        </div>
        {c.note && (
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">※ {c.note}</p>
        )}
      </section>

      {/* 러닝 포인트 */}
      <section className="mb-12">
        <SectionLabel>러닝 포인트</SectionLabel>
        <div className="space-y-5">
          {c.learnings.map((l) => (
            <div key={l.title} className="max-w-2xl">
              <p className="text-[15px] font-medium text-foreground">{l.title}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{l.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 구성 시스템 (DB 카드) */}
      {systems.length > 0 && (
        <section className="border-t border-border pt-8">
          <SectionLabel>이 케이스를 구성한 시스템</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-3">
            {systems.map((p) => (
              <Link
                key={p.slug}
                href={`/work/${p.slug}`}
                className="group border border-border p-4 hover:border-foreground transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-foreground leading-snug">
                    {p.title}
                  </h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{p.metric.value}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 구성 요소 (텍스트) */}
      {c.components && c.components.length > 0 && (
        <section className="border-t border-border pt-8">
          <SectionLabel>구성 요소</SectionLabel>
          <div className="space-y-3">
            {c.components.map((comp) => (
              <div key={comp.name} className="flex gap-3">
                <span className="text-muted-foreground pt-0.5">·</span>
                <p className="text-sm leading-relaxed">
                  <span className="text-foreground font-medium">{comp.name}</span>
                  <span className="text-muted-foreground"> — {comp.desc}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <AboutChatWidget />
    </div>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 케이스 스터디 우선
  const c = await getCaseBySlug(slug);
  if (c) return <CaseView c={c} />;

  // 개별 시스템 상세 (기존)
  const p = await getProjectBySlug(slug);
  if (!p) notFound();

  const bucket = BUCKETS.find((b) => b.key === p.bucket);

  return (
    <div className="mx-auto max-w-[52rem] px-6 py-12">
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
        <p className="text-[15px] text-muted-foreground mt-3 leading-relaxed">{p.problem}</p>
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
                <span className="text-xs text-muted-foreground">{row.axis}</span>
                <span className="text-sm text-muted-foreground line-through decoration-border">
                  {row.before}
                </span>
                <span className="text-sm text-foreground font-medium">{row.after}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 핵심 숫자 + how */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-4 flex-wrap">
          <span className="text-3xl font-mono font-semibold text-foreground tracking-tight">
            {p.metric.value}
          </span>
          <span className="text-xs text-muted-foreground">{p.metric.caption}</span>
        </div>
        {p.how && (
          <p className="text-[15px] text-muted-foreground leading-relaxed">
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
                <span
                  key={t}
                  className="px-2 py-0.5 text-[11px] text-foreground border border-border"
                >
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
