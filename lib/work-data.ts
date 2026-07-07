// /work 포트폴리오 — 타입 + 버킷 taxonomy + 인터랙티브 데모(코드 정의).
// 프로젝트 콘텐츠 자체는 DB(clipper.WorkProject)에서 읽는다. (어드민 편집용)

export interface PipelineStage {
  label: string;
  detail: string;
  human?: boolean;
}

export interface WorkProject {
  slug: string;
  bucket: string;
  title: string;
  oneLiner: string;
  tags: string[];
  problem: string;
  comparison: { axis: string; before: string; after: string }[];
  metric: { value: string; caption: string };
  how: string;
  evidence: string[];
  tech: string[];
  note?: string;
  demo?: { type: 'pipeline'; stages: PipelineStage[] };
  // 경력기술서(/resume)용 맥락
  company?: string;
  period?: string;
  role?: string;
}

export interface Bucket {
  key: string;
  label: string;
  desc: string;
}

// BizOps 6버킷 taxonomy (구조는 코드에서 관리)
export const BUCKETS: Bucket[] = [
  {
    key: 'commerce',
    label: '커머스 백엔드 · 결제/정산',
    desc: '결제·정산·구독 등 사업의 정산 구조를 직접 설계·자동화. (JD 우대·예시 과제와 정확히 일치)',
  },
  {
    key: 'ops',
    label: '운영구조 발굴 · 자동화 (0→1)',
    desc: '반복 운영을 시스템으로 대체하되 통제는 남긴다. 새 프로세스를 0에서 1로.',
  },
  {
    key: 'ai',
    label: 'AI 활용 · AX',
    desc: 'Claude 등 AI 도구로 업무 효율을 끌어올리고 자율 에이전트를 직접 설계.',
  },
  {
    key: 'strategy',
    label: '전략 · 의사결정',
    desc: '모호한 문제를 데이터로 구조화해 실행 계획으로 전환.',
  },
  {
    key: 'org',
    label: '조직 · 소통 체계',
    desc: '전략이 조직에 전달·실행되도록 운영 체계를 통합하고 현황을 가시화.',
  },
  {
    key: 'revenue',
    label: '매출 · 채널 · 파트너십',
    desc: '새로운 매출 기회·채널을 발굴하고 파트너 관계를 끝까지 책임.',
  },
];

// 인터랙티브 데모는 프로젝트 slug에 코드로 매핑 (어드민 편집 대상 아님)
export const DEMOS: Record<string, { type: 'pipeline'; stages: PipelineStage[] }> = {
  'recruit-pipeline': {
    type: 'pipeline',
    stages: [
      { label: '이벤트 감지', detail: '프로젝트 모집 시작을 자동으로 감지합니다.' },
      { label: '데이터 병렬 수집', detail: '제안서·과거 작업 이력·거절 패턴을 동시에 조회합니다.' },
      { label: 'LLM 판단', detail: '티어·발송 수·품질 필터를 맥락으로 결정합니다.' },
      { label: '매칭', detail: '조건에 맞는 에디터 후보를 산출합니다.' },
      { label: '추천 카드', detail: '근거와 함께 Slack에 추천을 제시합니다.' },
      { label: '1클릭 승인', detail: '사람은 여기서 최종 발송만 승인합니다. (Human-in-the-loop)', human: true },
      { label: '발송', detail: '알림톡을 자동 발송합니다. 누적 53,810건.' },
    ],
  },
};

// DB row(snake_case) → WorkProject
export interface WorkRow {
  slug: string;
  bucket: string;
  title: string;
  one_liner: string | null;
  tags: string[] | null;
  problem: string | null;
  comparison: { axis: string; before: string; after: string }[] | null;
  metric: { value: string; caption: string } | null;
  how: string | null;
  evidence: string[] | null;
  tech: string[] | null;
  note: string | null;
  sort_order: number | null;
  company: string | null;
  period: string | null;
  role: string | null;
}

export function mapRow(row: WorkRow): WorkProject {
  return {
    slug: row.slug,
    bucket: row.bucket,
    title: row.title,
    oneLiner: row.one_liner ?? '',
    tags: row.tags ?? [],
    problem: row.problem ?? '',
    comparison: row.comparison ?? [],
    metric: row.metric ?? { value: '', caption: '' },
    how: row.how ?? '',
    evidence: row.evidence ?? [],
    tech: row.tech ?? [],
    note: row.note ?? undefined,
    demo: DEMOS[row.slug],
    company: row.company ?? undefined,
    period: row.period ?? undefined,
    role: row.role ?? undefined,
  };
}
