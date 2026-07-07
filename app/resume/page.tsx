import { ResumeActions } from '@/components/resume/ResumeActions';
import { getAllProjects } from '@/lib/work-db';
import type { WorkProject } from '@/lib/work-data';
import { Mail, Linkedin, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '경력기술서',
  description: '김도현 (Michael Kim) — 프로젝트 기반 경력기술서. 검증된 성과 수치 중심.',
};

const POSITIONING = '운영을 시스템으로 바꾸는 Operations & AX 빌더';
const SUMMARY =
  'IT 스타트업 12년. 서비스 운영을 직접 총괄하다, 그 운영을 REST API·AI 에이전트로 대체하는 시스템을 직접 설계·구축했습니다. No-code 사내 도구에서 시작해 풀스택 자동화 플랫폼(연 600+ 커밋)까지 — 요구정의부터 운영까지 전 주기를 한 사람이 관통합니다.';

// 이전 경력 (간단 표기 — 상세는 LinkedIn)
const PRIOR_CAREER = '오픈서베이 · 캐시노트 · 굿닥 — 서비스 운영 (상세는 LinkedIn 참조)';

function groupByCompany(projects: WorkProject[]) {
  const groups = new Map<string, { period?: string; role?: string; items: WorkProject[] }>();
  for (const p of projects) {
    const key = p.company ?? '기타';
    if (!groups.has(key)) {
      groups.set(key, { period: p.period, role: p.role, items: [] });
    }
    groups.get(key)!.items.push(p);
  }
  return [...groups.entries()];
}

function buildMarkdown(groups: [string, { period?: string; role?: string; items: WorkProject[] }][]) {
  const lines: string[] = [
    '# 김도현 (Michael Kim) — 경력기술서',
    '',
    `${POSITIONING}`,
    '',
    SUMMARY,
    '',
    '- Email: michael.dohyun@gmail.com',
    '- LinkedIn: https://www.linkedin.com/in/michaeldohyun',
    '- Portfolio: https://when1.life/work',
    '',
  ];
  for (const [company, g] of groups) {
    lines.push(`## ${company}`);
    lines.push(`${g.period ?? ''}${g.role ? ` · ${g.role}` : ''}`.trim());
    lines.push('');
    for (const p of g.items) {
      lines.push(`### ${p.title}`);
      if (p.problem) lines.push(`- **배경**: ${p.problem}`);
      if (p.how) lines.push(`- **수행**: ${p.how}`);
      if (p.metric.value) lines.push(`- **성과**: ${p.metric.value} — ${p.metric.caption}`);
      if (p.evidence.length) lines.push(`- **검증**: ${p.evidence.join(' · ')}`);
      if (p.tech.length) lines.push(`- **기술**: ${p.tech.join(', ')}`);
      if (p.note) lines.push(`- ※ ${p.note}`);
      lines.push('');
    }
  }
  lines.push(`## 이전 경력`);
  lines.push(PRIOR_CAREER);
  return lines.join('\n');
}

export default async function ResumePage() {
  const projects = await getAllProjects();
  const groups = groupByCompany(projects);
  const markdown = buildMarkdown(groups);

  return (
    <div className="mx-auto max-w-[52rem] px-6 py-12 print:py-4">
      {/* 문서 헤더 */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-medium text-foreground">
            김도현 <span className="text-muted-foreground">Michael Kim</span>
          </h1>
          <p className="text-sm text-foreground mt-1.5">{POSITIONING}</p>
        </div>
        <ResumeActions markdown={markdown} />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3 mb-6">
        <a
          href="mailto:michael.dohyun@gmail.com"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          michael.dohyun@gmail.com
        </a>
        <a
          href="https://www.linkedin.com/in/michaeldohyun"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Linkedin className="w-3.5 h-3.5" />
          linkedin.com/in/michaeldohyun
        </a>
      </div>

      <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 print:mb-6 max-w-2xl">
        {SUMMARY}
      </p>

      {/* 회사별 프로젝트 */}
      {groups.map(([company, g]) => (
        <section key={company} className="mb-10 print:mb-6">
          <div className="border-b border-foreground pb-2 mb-6">
            <h2 className="text-base font-medium text-foreground">{company}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {[g.period, g.role].filter(Boolean).join(' · ')}
            </p>
          </div>

          <div className="space-y-8 print:space-y-5">
            {g.items.map((p) => (
              <article key={p.slug} className="break-inside-avoid">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-medium text-foreground">{p.title}</h3>
                  <Link
                    href={`/work/${p.slug}`}
                    className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors print:hidden flex-shrink-0"
                  >
                    상세
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
                <dl className="mt-2 space-y-1.5 text-sm leading-relaxed">
                  {p.problem && (
                    <div className="grid grid-cols-[48px_1fr] gap-2">
                      <dt className="text-xs text-muted-foreground pt-0.5">배경</dt>
                      <dd className="text-muted-foreground">{p.problem}</dd>
                    </div>
                  )}
                  {p.how && (
                    <div className="grid grid-cols-[48px_1fr] gap-2">
                      <dt className="text-xs text-muted-foreground pt-0.5">수행</dt>
                      <dd className="text-foreground">{p.how}</dd>
                    </div>
                  )}
                  {p.metric.value && (
                    <div className="grid grid-cols-[48px_1fr] gap-2">
                      <dt className="text-xs text-muted-foreground pt-0.5">성과</dt>
                      <dd className="text-foreground font-medium">
                        {p.metric.value}
                        <span className="font-normal text-muted-foreground">
                          {' '}
                          — {p.metric.caption}
                        </span>
                      </dd>
                    </div>
                  )}
                  {p.tech.length > 0 && (
                    <div className="grid grid-cols-[48px_1fr] gap-2">
                      <dt className="text-xs text-muted-foreground pt-0.5">기술</dt>
                      <dd className="text-muted-foreground">{p.tech.join(', ')}</dd>
                    </div>
                  )}
                  {p.note && (
                    <div className="grid grid-cols-[48px_1fr] gap-2">
                      <dt className="text-xs text-muted-foreground pt-0.5">※</dt>
                      <dd className="text-[12px] text-muted-foreground">{p.note}</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* 이전 경력 */}
      <section className="border-t border-border pt-5">
        <h2 className="text-xs font-medium text-muted-foreground mb-2">이전 경력</h2>
        <p className="text-sm text-muted-foreground">{PRIOR_CAREER}</p>
      </section>
    </div>
  );
}
