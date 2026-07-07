import { AboutChatWidget } from '@/components/about/AboutChatWidget';
import { getAllProjects } from '@/lib/work-db';
import { ArrowRight, ArrowUpRight, Mail, Linkedin } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// 대표 프로젝트 3개 (검증 효과 기준)
const FEATURED_SLUGS = ['recruit-pipeline', 'lifecycle-watcher', 'solo-ops-transition'];

export default async function Home() {
  const projects = await getAllProjects();
  const featured = FEATURED_SLUGS.map((s) => projects.find((p) => p.slug === s)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Pitch */}
      <section className="mb-14">
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground leading-snug">
          운영을 시스템으로 바꾸는
          <br />
          Operations &amp; AX 빌더
        </h1>
        <p className="text-sm text-muted-foreground mt-5 leading-relaxed max-w-xl">
          김도현 Michael Kim. IT 스타트업 12년 — 서비스 운영을 직접 총괄하다, 그
          운영을 REST API·AI 에이전트로 대체하는 시스템을 직접 설계하고
          구축했습니다. 모든 성과는 프로덕션 DB·로그로 검증된 숫자로만 말합니다.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            포트폴리오 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/resume"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-foreground border border-border hover:border-foreground transition-colors"
          >
            경력기술서
          </Link>
          <a
            href="mailto:michael.dohyun@gmail.com"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="이메일"
          >
            <Mail className="w-4 h-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/michaeldohyun"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* 검증 숫자 스트립 */}
      {featured.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-3 border border-border divide-y sm:divide-y-0 sm:divide-x divide-border mb-14">
          {featured.map((p) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className="group px-5 py-6 hover:bg-muted/30 transition-colors"
            >
              <p className="text-2xl font-semibold text-foreground">{p.metric.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                {p.metric.caption}
              </p>
              <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-foreground mt-3 transition-colors">
                {p.title}
                <ArrowUpRight className="w-3 h-3" />
              </p>
            </Link>
          ))}
        </section>
      )}

      {/* 한 줄 서사 + 챗봇 안내 */}
      <section className="text-xs text-muted-foreground leading-relaxed space-y-2">
        <p>
          No-code로 사내 도구를 만들던 운영자에서, REST API·Edge Function·AI
          에이전트를 직접 설계·코딩하는 단계까지. 요구정의 → 설계 → 구현 → QA →
          배포 → 운영의 전 주기를 한 사람이 관통합니다.
        </p>
        <p>
          우측 하단의 Q&amp;A 봇도 직접 만들었습니다 — 경력에 대해 무엇이든
          물어보세요.
        </p>
      </section>

      <AboutChatWidget />
    </div>
  );
}
