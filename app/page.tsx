import { AboutChatWidget } from '@/components/about/AboutChatWidget';
import { getHomeHero, type HeroDiagramBox } from '@/lib/content-db';
import { ArrowRight, Mail, Linkedin } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function MultiLine({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

// sub 문장 안에서 지정 문자열만 모노 강조
function HighlightedSub({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const [pre, ...rest] = text.split(highlight);
  return (
    <>
      {pre}
      <span className="font-mono text-foreground">{highlight}</span>
      {rest.join(highlight)}
    </>
  );
}

function DiagramBox({
  box,
  tone,
}: {
  box: HeroDiagramBox;
  tone: 'before' | 'build' | 'after';
}) {
  const wrap =
    tone === 'before'
      ? 'border border-dashed border-border'
      : tone === 'build'
        ? 'border border-foreground'
        : 'bg-foreground text-background';
  const label =
    tone === 'after' ? 'opacity-70' : 'text-muted-foreground';
  const title = tone === 'before' ? 'text-muted-foreground' : tone === 'build' ? 'text-foreground' : '';
  const desc = tone === 'after' ? 'opacity-80' : 'text-muted-foreground';
  return (
    <div className={`flex-1 px-4 py-4 ${wrap}`}>
      <p className={`text-[11px] font-mono tracking-wide mb-2 ${label}`}>{box.label}</p>
      <p className={`text-sm font-medium ${title}`}>{box.title}</p>
      <p className={`text-[13px] mt-1.5 leading-relaxed ${desc}`}>
        <MultiLine text={box.desc} />
      </p>
    </div>
  );
}

export default async function Home() {
  const hero = await getHomeHero();

  return (
    <div className="mx-auto max-w-[52rem] px-6 py-16">
      {/* Pitch — 결과 선언(Claim) → 증거 → 방식 */}
      <section className="mb-12">
        <p className="text-xs font-mono text-muted-foreground tracking-wide mb-3">
          {hero.kicker}
        </p>
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground leading-snug">
          <MultiLine text={hero.headline} />
        </h1>
        <p className="text-[15px] text-muted-foreground mt-5 leading-relaxed max-w-xl">
          <HighlightedSub text={hero.sub} highlight={hero.subHighlight} />
        </p>
      </section>

      {/* 수치 강조 카드 (visual='metrics') */}
      {hero.visual === 'metrics' && (hero.metrics ?? []).length > 0 && (
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(hero.metrics ?? []).map((m, i) =>
              m.href ? (
                <Link
                  key={i}
                  href={m.href}
                  className="group border border-border px-5 py-6 hover:border-foreground transition-colors"
                >
                  <p className="text-2xl font-mono font-semibold text-foreground tracking-tight">
                    {m.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {m.caption}
                  </p>
                </Link>
              ) : (
                <div key={i} className="border border-border px-5 py-6">
                  <p className="text-2xl font-mono font-semibold text-foreground tracking-tight">
                    {m.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {m.caption}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {/* 전환 다이어그램 (visual='diagram') */}
      {hero.visual !== 'none' && hero.visual !== 'metrics' && (
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <DiagramBox box={hero.diagram.before} tone="before" />
          <div className="flex sm:flex-col items-center justify-center px-1 text-muted-foreground">
            <span className="hidden sm:block text-[10px] font-mono mb-1">
              {hero.diagram.arrow1}
            </span>
            <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
          </div>
          <DiagramBox box={hero.diagram.build} tone="build" />
          <div className="flex sm:flex-col items-center justify-center px-1 text-muted-foreground">
            <span className="hidden sm:block text-[10px] font-mono mb-1">
              {hero.diagram.arrow2}
            </span>
            <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
          </div>
          <DiagramBox box={hero.diagram.after} tone="after" />
        </div>
      </section>
      )}

      {/* CTA */}
      <section className="mb-14">
        <div className="flex flex-wrap items-center gap-3">
          {(hero.ctas ?? []).map((cta, i) => (
            <Link
              key={`${cta.href}-${i}`}
              href={cta.href}
              className={
                cta.style === 'primary'
                  ? 'inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-foreground text-background hover:opacity-90 transition-opacity'
                  : 'inline-flex items-center gap-1.5 px-4 py-2 text-sm text-foreground border border-border hover:border-foreground transition-colors'
              }
            >
              {cta.label}
              {cta.style === 'primary' && <ArrowRight className="w-4 h-4" />}
            </Link>
          ))}
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

      {/* 챗봇 안내 */}
      <section className="text-sm text-muted-foreground leading-relaxed max-w-xl">
        <p>{hero.chatLine}</p>
      </section>

      <AboutChatWidget />
    </div>
  );
}
