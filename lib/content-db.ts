import { clipperDb } from './supabase';
import { CASES, type CaseStudy } from './case-data';

// ── 홈 히어로 ──────────────────────────────────────

export interface HeroDiagramBox {
  label: string;
  title: string;
  desc: string; // \n 줄바꿈 지원
}

export type HeroVisual = 'diagram' | 'metrics' | 'none';

export interface HeroMetric {
  value: string;
  caption: string;
  href?: string; // 클릭 시 이동 (선택)
}

export interface HeroCta {
  label: string;
  href: string;
  style: 'primary' | 'outline';
}

export interface HomeHero {
  kicker: string;
  headline: string; // \n 줄바꿈 지원
  sub: string;
  subHighlight?: string; // sub 안에서 모노 강조할 부분 문자열
  diagram: {
    before: HeroDiagramBox;
    build: HeroDiagramBox;
    after: HeroDiagramBox;
    arrow1: string;
    arrow2: string;
  };
  chatLine: string;
  /** 히어로 아래 시각화 종류 (기본: diagram) */
  visual?: HeroVisual;
  /** CTA 버튼들 (순서대로 렌더) */
  ctas?: HeroCta[];
  /** visual='metrics'일 때 표시할 수치 카드 */
  metrics?: HeroMetric[];
}

export const DEFAULT_HERO: HomeHero = {
  kicker: '김도현 Michael Kim — 운영을 시스템으로 바꾸는 Operations & AX 빌더',
  headline: '매니저 5~6명이 하던 운영을,\n실무 3명이 하게 만들었습니다.',
  sub: '처리량은 그대로 — 월 제안서 300~440건. 사람을 더 뽑는 대신 운영을 분해해 다시 설계했습니다. 반복 판단은 LLM에게 맡기고, 돈·발송·확정 같은 위험한 결정만 사람에게 남겼습니다.',
  subHighlight: '300~440건',
  diagram: {
    before: { label: 'BEFORE', title: '사람이 하던 운영', desc: '상담 · 견적 · 매칭 · 정산 · CS\n운영량이 사람 수에 비례' },
    build: { label: 'BUILD', title: '직접 만든 시스템', desc: 'REST API · Edge Function\nLLM 에이전트 · 자동화 봇' },
    after: { label: 'AFTER', title: '사람은 판단과 승인만', desc: 'Human-in-the-loop\n성과는 검증된 숫자로만' },
    arrow1: '분해·재설계',
    arrow2: '남기는 것',
  },
  chatLine: '우측 하단의 Q&A 봇도 직접 만들었습니다 — 경력에 대해 무엇이든 물어보세요.',
  visual: 'diagram',
  ctas: [
    { label: '어떻게 했는지 보기', href: '/work/editmate-one-person-ops', style: 'primary' },
    { label: '케이스 전체', href: '/work', style: 'outline' },
  ],
  metrics: [
    { value: '5~6명 → 3명', caption: '처리량 유지한 채 줄인 운영 인력 (월 300~440건)', href: '/work/editmate-one-person-ops' },
    { value: '53,810건', caption: '알림톡 누적 자동 발송 — 사람 손 없이', href: '/work/recruit-pipeline' },
    { value: '2,515개', caption: 'LLM이 대신 지켜본 프로젝트 · 정산 100건 자동 집행', href: '/work/lifecycle-watcher' },
  ],
};

export async function getHomeHero(): Promise<HomeHero> {
  const { data, error } = await clipperDb
    .from('SiteContent')
    .select('content')
    .eq('key', 'home_hero')
    .maybeSingle();
  if (error || !data?.content) return DEFAULT_HERO;
  // 부분 저장에 대비해 기본값과 병합
  const c = data.content as Partial<HomeHero>;
  return {
    ...DEFAULT_HERO,
    ...c,
    diagram: { ...DEFAULT_HERO.diagram, ...(c.diagram ?? {}) },
  };
}

// ── 케이스 스터디 ──────────────────────────────────

interface CaseRow {
  slug: string;
  title: string;
  one_liner: string | null;
  period: string | null;
  role: string | null;
  context: string | null;
  reframe: string | null;
  decisions: { title: string; detail: string }[] | null;
  impact: { value: string; caption: string }[] | null;
  learnings: { title: string; detail: string }[] | null;
  system_slugs: string[] | null;
  components: { name: string; desc: string }[] | null;
  demo_slug: string | null;
  note: string | null;
  sort_order: number | null;
}

const CASE_COLUMNS =
  'slug,title,one_liner,period,role,context,reframe,decisions,impact,learnings,system_slugs,components,demo_slug,note,sort_order';

function mapCase(row: CaseRow): CaseStudy {
  return {
    slug: row.slug,
    title: row.title,
    oneLiner: row.one_liner ?? '',
    period: row.period ?? '',
    role: row.role ?? '',
    context: row.context ?? '',
    reframe: row.reframe ?? '',
    decisions: row.decisions ?? [],
    impact: row.impact ?? [],
    learnings: row.learnings ?? [],
    systemSlugs: row.system_slugs ?? undefined,
    components: row.components ?? undefined,
    demoSlug: row.demo_slug ?? undefined,
    note: row.note ?? undefined,
  };
}

export async function getCases(): Promise<CaseStudy[]> {
  const { data, error } = await clipperDb
    .from('CaseStudy')
    .select(CASE_COLUMNS)
    .order('sort_order', { ascending: true });
  if (error || !data || data.length === 0) return CASES; // 폴백: 코드 시드
  return (data as unknown as CaseRow[]).map(mapCase);
}

export async function getCaseBySlug(slug: string): Promise<CaseStudy | null> {
  const { data, error } = await clipperDb
    .from('CaseStudy')
    .select(CASE_COLUMNS)
    .eq('slug', slug)
    .maybeSingle();
  if (error) return CASES.find((c) => c.slug === slug) ?? null;
  if (!data) return null;
  return mapCase(data as unknown as CaseRow);
}
