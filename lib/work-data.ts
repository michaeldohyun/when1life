// /work 포트폴리오 데이터 — BizOps 6버킷 렌즈로 구성.
// 출처: career-evidence-bank (BUILD-INVENTORY, metrics-ledger). ✅=실측 검증.

export interface PipelineStage {
  label: string;
  detail: string;
  human?: boolean;
}

export interface WorkProject {
  slug: string;
  bucket: string; // BUCKETS의 key
  title: string;
  oneLiner: string;
  tags: string[];
  problem: string;
  comparison: { axis: string; before: string; after: string }[];
  metric: { value: string; caption: string };
  how: string;
  evidence: string[];
  tech: string[];
  note?: string; // 정직성 각주(표본·저채택 등)
  demo?: { type: 'pipeline'; stages: PipelineStage[] };
}

export interface Bucket {
  key: string;
  label: string;
  desc: string;
}

// JD(algocare BizOps) 언어 기준 6버킷 — 적합도 강한 순
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

export const PROJECTS: WorkProject[] = [
  // ── 커머스 백엔드 ──────────────────────────────
  {
    slug: 'cash-payment-automation',
    bucket: 'commerce',
    title: '캐시 결제 자동화 (입금 → 증빙 → 매출)',
    oneLiner: '7단계 수동 정산을 입금 감지부터 매출 기록까지 자동화',
    tags: ['커머스 백엔드', '업무자동화', 'Operations'],
    problem:
      '캐시 충전이 입금 확인 → 충전 입력 → 증빙 → 세금계산서 → 매출 기록의 7단계 수작업(2명)이었고, 입금자명 추정 매칭도 부정확했습니다.',
    comparison: [
      { axis: '처리 단계', before: '7단계 수동', after: '0~1단계' },
      { axis: '매니저 관여', before: '매건 3단계', after: '0단계' },
      { axis: '관리툴 접속', before: '건당 2회', after: '0회' },
      { axis: '미수금 추적', before: '수동', after: '자동' },
    ],
    metric: { value: '7단계 → 0~1', caption: '입금 → 증빙 → 매출 결제 처리 자동화' },
    how: '입금 알림 Slack 파싱 → 고객 매칭 → 충전 API → 증빙 카드(버튼) → 매출 시트 자동 기록. Phase 2는 PG 청구서 + 웹훅으로 자동 감지.',
    evidence: ['매니저 관여 0단계', '미수금 추적 자동화', 'JD 예시 과제와 일치'],
    tech: ['Slack Block Kit', 'Steppay API+웹훅', 'Google Sheets API', 'Supabase'],
  },
  {
    slug: 'settlement-rules-ssot',
    bucket: 'commerce',
    title: '정산 협의규칙 단일화 + 셀프편집 위젯',
    oneLiner: '3곳에 흩어진 정산 단가를 단일 테이블로, 운영팀이 직접 수정',
    tags: ['커머스 백엔드', 'Internal Product'],
    problem:
      '고객별 협의 정산 단가가 문서 도구·로컬 JSON·코드 하드코딩 3곳에 분산되어, 단가 하나 바꾸려면 세 곳을 따로 고쳐야 했고 운영팀은 직접 손도 못 댔습니다.',
    comparison: [
      { axis: '진실 원천', before: '3곳 분산', after: '단일 테이블' },
      { axis: '수정 주체', before: '개발자', after: '운영팀 셀프' },
      { axis: '전환 검증', before: '수동 확인', after: '패리티 23/23' },
      { axis: '롤백', before: '불가', after: '전환 플래그' },
    ],
    metric: { value: '3 → 1', caption: '정산 단가 진실 원천 통합 · 패리티 불일치 0건' },
    how: '이질적인 단가표를 JSONB 단일 테이블로 흡수 설계, 백필 후 패리티 테스트(23/23)로 산출 동일성 검증. 어드민 고객 페이지에 그리드 편집 위젯을 붙였습니다.',
    evidence: ['패리티 23/23 통과', '불일치 0건', '운영팀 셀프편집'],
    tech: ['Supabase (JSONB)', 'Python', 'Next.js', 'pytest'],
  },

  // ── 운영구조 0→1 ──────────────────────────────
  {
    slug: 'recruit-pipeline',
    bucket: 'ops',
    title: '에디터 자동 모집 파이프라인',
    oneLiner: '8단계 수작업 모집을 이벤트 감지 → 1클릭 승인으로',
    tags: ['운영구조 0→1', 'AX', 'LLM'],
    problem:
      '에디터 모집이 스레드 확인 → 제안서 분석 → 과거 이력 조회 → 거절 패턴 분석 → 매칭 → 검증 → 발송의 8단계 수작업이라, 여러 프로젝트가 동시에 모집에 들어가면 매니저 한 명이 병목이 됐습니다.',
    comparison: [
      { axis: '프로세스', before: '8단계 수작업', after: '이벤트 감지 → 1클릭' },
      { axis: '사람 개입', before: '전 단계 수동', after: '최종 발송 승인 1회' },
      { axis: '판단(티어·필터)', before: '사람이 매번', after: 'LLM이 맥락 적용' },
      { axis: '동시 모집', before: '매니저 병목', after: '병렬 처리' },
    ],
    metric: { value: '53,810건', caption: '알림톡 누적 자동 발송 · 월 248 → 11,688 (47배)' },
    how: '이벤트 감지 → 데이터 병렬 수집 → LLM 판단 → 매칭 → 추천 카드 → 1클릭 승인 → 발송 파이프라인을 2개 서비스로 분리 설계·구축(Railway 배포).',
    evidence: ['DB 집계 53,810건', '오퍼 35,054건', '실서비스 배포·가동', '발송 승인 1회로 축소'],
    tech: ['TypeScript · Express', 'LLM', 'Postgres/MySQL', 'Railway'],
    demo: {
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
  },
  {
    slug: 'lifecycle-watcher',
    bucket: 'ops',
    title: '라이프사이클 워처 (LLM 모니터링)',
    oneLiner: '프로젝트 2,515개를 LLM이 자동 추적, 사람은 버튼만',
    tags: ['운영구조 0→1', 'LLM', 'HITL'],
    problem:
      '활성 프로젝트가 정상 진행 중인지, 종료·리마인드가 필요한지를 매니저가 코멘트를 일일이 확인해야 했는데, 매니저가 3명에서 1명으로 줄면서 모니터링이 병목이 됐습니다.',
    comparison: [
      { axis: '모니터링', before: '매니저 수동 점검', after: 'LLM 자동 판단' },
      { axis: '사람 역할', before: '판단 + 실행', after: '제안된 버튼만 승인' },
      { axis: '안전장치', before: '없음', after: 'confidence·환각·미완료 가드' },
      { axis: '커버 규모', before: '사람이 감당', after: '프로젝트 2,515개' },
    ],
    metric: { value: '2,515개', caption: 'LLM 자동 추적 · 100건 정산 자동 집행 · 분석 $0.027/건' },
    how: '별도 워커가 다단계 폴링하고 LLM이 코멘트·경과 시간·산출물을 분석해 종료/리마인드/지연을 판단, Slack에 액션 버튼을 제안합니다. 자동 실행이 아닌 승인 구조(confidence 0.7 미만 스킵·시간 환각 방지·산출물 미완료 시 종료 차단).',
    evidence: ['워커 로그·DB', '576건 조치 제안', '100건 정산 집행', 'HITL 승인 구조'],
    tech: ['Railway', 'Claude', 'TypeScript', 'PlanetScale', 'Slack Block Kit', 'pg_cron'],
  },
  {
    slug: 'matching-engine',
    bucket: 'ops',
    title: '에디터 매칭 엔진 v2 (8차원 스코어링)',
    oneLiner: '프리랜서 1,000명 풀을 근거 기반 274명으로 자동 압축',
    tags: ['운영구조 0→1', 'AI PM'],
    problem:
      '프로젝트마다 적합 에디터를 사람이 감으로 골라 오퍼해서 근거가 불투명하고 누락·편향이 빈발했습니다.',
    comparison: [
      { axis: '선별 방식', before: '감으로', after: '8차원 가중 스코어링' },
      { axis: '풀 규모', before: '1,000명', after: '274명 자동 압축' },
      { axis: '근거', before: '없음', after: '점수 + LLM 코멘트' },
      { axis: '편향', before: '빈발', after: '의사결정 표준화' },
    ],
    metric: { value: '1,000 → 274명', caption: '프리랜서 풀 근거 기반 자동 압축' },
    how: '태그·평점·이슈패널티·작업량·경험·오퍼신뢰도·성공률 8차원 가중 합산 매칭 CLI를 설계·구현. 하드필터로 풀을 압축하고 고객 과거 성공 에디터를 별도 티어로, LLM이 근거 코멘트 자동 생성.',
    evidence: ['다수 고객 건 현장 검증', '결정적 산출·재현 가능'],
    tech: ['Python', 'MySQL', 'REST API', 'LLM 구조화 출력'],
  },

  // ── AI 활용 · AX ──────────────────────────────
  {
    slug: 'psbot-agent-sdk',
    bucket: 'ai',
    title: 'PS Bot Agent SDK 마이그레이션',
    oneLiner: '커맨드봇을 한 번의 자연어로 복합작업하는 자율 오케스트레이터로',
    tags: ['AX', 'LLM', 'AI PM'],
    problem:
      '운영 봇이 커맨드 단위 독립 세션이라 복합 작업 시 여러 번 명령해야 하고 맥락이 끊겼습니다. 에이전트 루프와 도구 18개를 수동 유지했고, 긴 세션은 중단됐습니다.',
    comparison: [
      { axis: '구조', before: '커맨드봇', after: '자율 오케스트레이터' },
      { axis: '복합 작업', before: '여러 번 명령', after: '한 번의 자연어' },
      { axis: '에이전트 루프', before: '200줄 수동', after: 'SDK + MCP' },
      { axis: '긴 세션', before: '중단', after: '자동 compaction·resume' },
    ],
    metric: { value: '도구 18개 · 200줄', caption: '수동 에이전트 루프를 Agent SDK + MCP로 대체' },
    how: 'Claude Agent SDK 기반 오케스트레이터로 재설계. in-process 커스텀 MCP로 좀비 프로세스 회피, 비싼 견적은 저렴한 모델 서브에이전트로 위임, SDK 리스크 6종 완화책 카탈로그화, 비용 가드·자동 compaction·세션 resume 도입.',
    evidence: ['복합작업 한 번의 자연어 처리', 'SDK+MCP로 수동 루프 대체'],
    tech: ['Claude Agent SDK', 'MCP', '멀티모델(Sonnet/Haiku)', 'TypeScript', 'Railway'],
  },
  {
    slug: 'proposal-nl-workflow',
    bucket: 'ai',
    title: '제안서 워크플로우 자연어 자동화',
    oneLiner: '6단계 수동 클릭 워크플로우를 자연어로, Express는 5분',
    tags: ['AX', 'AI PM', '업무자동화'],
    problem: '6단계 제안서 워크플로우(수정 → 고객 알림 → 비용 확정 → 매칭 → 오퍼 → 확정)가 전부 어드민 UI 수동 클릭이었습니다.',
    comparison: [
      { axis: '실행', before: '어드민 수동 클릭', after: '자연어 병행 실행' },
      { axis: '처리 시간(일반)', before: '약 46분', after: '단축' },
      { axis: '정기고객(Express)', before: '약 46분', after: '약 5분 (1/9)' },
    ],
    metric: { value: '46분 → 5분', caption: '정기고객 Express 워크플로우 (1/9)' },
    how: '"읽기는 DB 직접, 쓰기는 어드민 API 경유, 콘텐츠 수정만 직접" 원칙으로 어드민 UI를 유지한 채 Claude Code에서 자연어로 병행 실행하게 설계. 정기 고객용 축약(Express) 워크플로우 추가.',
    evidence: ['실제 2건 E2E 검증'],
    tech: ['Python', 'Supabase (JSONB)', 'admin REST', 'Claude Code Skills'],
    note: '처리 시간 단축은 실제 2건 케이스로 E2E 검증(표본 작음).',
  },

  // ── 전략 · 의사결정 ──────────────────────────────
  {
    slug: 'data-reversal',
    bucket: 'strategy',
    title: '데이터로 매칭 통념을 뒤집다',
    oneLiner: '한 달치 데이터로 "고점수·다발송" 통념을 반증하고 엔진 방향 재설계',
    tags: ['AI PM', 'Process Innovation', '데이터'],
    problem:
      '"오퍼를 많이 보내고 점수 높은 사람을 고를수록 매칭이 잘 된다"는 통념으로 무차별 발송을 해왔는데, 정작 검증된 적이 없고 프리랜서 피로도와 응답률 저하만 쌓이고 있었습니다.',
    comparison: [
      { axis: '판단 근거', before: '통념·감', after: '한 달치 데이터 검증' },
      { axis: '매칭 전략', before: '무차별 살포', after: '과거 에디터 핀포인트' },
      { axis: '핵심 변수', before: '점수(추정)', after: '과거 작업 유무(입증)' },
    ],
    metric: { value: '5,700건', caption: '도출한 원칙이 실제 모집 발송에 반영 (전체 source 최대 비중)' },
    how: '한 달치 모집 데이터로 4개 가설을 검증(selection bias 보정). "상위 분기를 가르는 진짜 변수는 점수가 아니라 과거 작업 에디터 유무"라는 결론을 도출하고, 복잡한 스코어링을 걷어내 "과거 에디터 핀포인트 → 실패 시에만 다발송" 구조로 재설계.',
    evidence: ['과거 에디터 수락률 12~70배', '고점수 그룹 수락 0%', '소수 발송 88% vs 대량 71%', 'DB 집계 5,700건 반영'],
    tech: ['SQL 분석', '가설 검증', '통계적 인과 해석'],
  },
  {
    slug: 'solo-ops-transition',
    bucket: 'strategy',
    title: '다수 매니저 이탈 구간의 운영 일원화',
    oneLiner: '인력 축소·자동화 전환을 설계·실행해 처리량을 유지',
    tags: ['AI PM', 'Operations', 'Process Innovation'],
    problem:
      '매니저 다수 이탈로 운영 인력을 크게 줄여야 하는 상황이었습니다. 수동으로는 1인이 감당 가능한 규모가 당시의 1/3 수준이었습니다.',
    comparison: [
      { axis: '운영 인력', before: '매니저 5~6명', after: '실응대 3인 + 자동화' },
      { axis: '대외 창구', before: '분산', after: '단일 운영지원센터' },
      { axis: '제안서 처리량', before: '(감소 위험)', after: '월 300~440건 유지' },
      { axis: '정산', before: '(감당 한계)', after: '누적 2,831건 유지' },
    ],
    metric: { value: '300~440건/월', caption: '5~6 → 3인 일원화 구간에도 유지한 제안서 처리량' },
    how: '전체 운영 시스템을 분석해 단계별 인력 축소 로드맵과 자동화 커버율 전환 기준을 만들고, 핵심 인력의 역할을 "실행자 → 검수자"로 재정의했습니다.',
    evidence: ['DB 집계', '실응대 3인 유지', '누적 정산 2,831건'],
    tech: ['운영 프로세스 분석', 'AI 보조 워크플로우 설계', '비용·리스크 모델링'],
    note: '"14→1명·3.7배"는 설계 목표(모델링)라 헤드라인에서 제외하고 실측만 표기.',
  },

  // ── 조직 · 소통 체계 ──────────────────────────────
  {
    slug: 'master-thread',
    bucket: 'org',
    title: '마스터 스레드 운영 통합 + 액션 허브',
    oneLiner: '3채널에 분산된 운영을 단일 스레드로 통합하고 인-스레드 액션화',
    tags: ['Internal Product', '업무자동화', 'Process Innovation'],
    problem:
      '제안서 1건의 활동이 컨펌·오퍼·프로젝트 3채널에 분산되어 스레드당 평균 17건(최대 126)의 노이즈가 쌓였고, 만든 통합 뷰는 읽기 전용이라 행동하려면 원본으로 다시 이탈해야 했습니다.',
    comparison: [
      { axis: '채널', before: '3채널 분산', after: '단일 스레드' },
      { axis: '통합 뷰', before: '읽기 전용', after: '인-스레드 액션' },
      { axis: '봇 충돌', before: '액션 겹침', after: '네임스페이스 분리' },
    ],
    metric: { value: '3채널 → 1', caption: '분산 운영을 단일 스레드로 통합 · 30일 데이터 3중 분석' },
    how: 'proposal_id ↔ thread_ts 매핑 + 미러 모드 아키텍처로 무중단 전환. 30일 운영 데이터를 3중 교차분석해 5대 케이스를 Slack 버튼·모달로 스레드에 흡수, "데이터 정본을 가진 시스템이 액션 주체" 원칙으로 봇 책임 분리.',
    evidence: ['30일 데이터 3중 분석', '알림톡 인프라 위 53,810건 동작'],
    tech: ['Slack Web API (멀티봇)', 'Supabase', 'TypeScript', 'Feature flag'],
    note: '함께 설계한 협상 자동화는 운영 채택 18건에 그쳐, "50% 자동화"는 실현되지 않았습니다(정직한 한계).',
  },

  // ── 매출 · 채널 · 파트너십 ──────────────────────────────
  {
    slug: 'growth-infra',
    bucket: 'revenue',
    title: '그로스 측정 인프라 (GTM/GA4/Meta)',
    oneLiner: '전환 측정 인프라를 직접 구축해 마케팅을 데이터로 판단',
    tags: ['업무자동화', 'Operations', '마케팅'],
    problem: '전환 측정 인프라가 없어 마케팅 효율을 데이터로 판단하지 못했습니다.',
    comparison: [
      { axis: '전환 측정', before: '없음', after: 'GTM 6태그·GA4·픽셀' },
      { axis: 'CPA', before: '추정', after: 'Real CPA 매핑' },
      { axis: 'UTM', before: '수동', after: '자동 전달' },
    ],
    metric: { value: '전환 추적 인프라', caption: 'GTM·GA4·Meta 픽셀 직접 구축·검증' },
    how: 'GTM 글로벌 설치(6개 태그) + GA4/Google Ads/Meta 픽셀 검증, 중복 스크립트 정리. Meta 전환이벤트 추적 아키텍처 진단, UTM 자동 전달 구현, 광고 지출 ↔ 폼 전환 매핑으로 Real CPA 산출.',
    evidence: ['전환 추적 인프라 구축·검증', '데이터 주도 그로스 회의체 운영'],
    tech: ['GTM', 'GA4', 'Google Ads', 'Meta 픽셀', 'UTM'],
  },
  {
    slug: 'editor-negotiation',
    bucket: 'revenue',
    title: '전담 에디터 거절 → 고객 협상 자동화',
    oneLiner: '거절을 협상 경로로 전환해 전담 에디터 이탈을 회수',
    tags: ['업무자동화', 'AI PM'],
    problem:
      '에디터 거절 시 무조건 다음으로 넘어가, 반복 고객의 전담 에디터(배정 86%)가 일정·비용으로 거절해도 조율 기회를 흘려보냈습니다.',
    comparison: [
      { axis: '거절 처리', before: '다음 에디터로', after: '협상 경로로 분기' },
      { axis: '조율', before: '수동/누락', after: '알림톡 자동 안내' },
      { axis: '전담 이탈', before: '방치', after: '협상으로 회수' },
    ],
    metric: { value: '자동 회수 경로', caption: '전담 에디터 이탈을 협상으로 회수하는 경로 신설' },
    how: '거절 메시지를 사유 분류 → 반복+협상 가능 사유면 고객에게 알림톡 자동 발송 → 전용 랜딩(JWT)에서 일정/비용 조정 → 매니저 중계 → 4시간 미응답 시 자동 신규 모집 전환.',
    evidence: ['거절 사유 데이터로 우선순위 정당화', '협상 경로 자동화 구축'],
    tech: ['Edge Function', 'Solapi', 'JWT', 'Next.js', 'MySQL API'],
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}

export function projectsByBucket(bucketKey: string) {
  return PROJECTS.filter((p) => p.bucket === bucketKey);
}
