# when1life 워크플로우 포트폴리오 리팩토링 계획

> 버전: 1.0
> 작성일: 2026-01-27
> 상태: 계획

---

## 📋 목차

1. [개요](#개요)
2. [현재 구조](#현재-구조)
3. [목표 구조](#목표-구조)
4. [DB 구조](#db-구조)
5. [구현 계획](#구현-계획)
6. [파일 목록](#파일-목록)
7. [검증 방법](#검증-방법)

---

## 개요

### 목적
when1life를 개인 AI 워크플로우 포트폴리오 사이트로 확장

### 요구사항
- 3개 서비스(Clipper, Running Coach, Fasting Coach) 포트폴리오 형태로 소개
- 각 서비스에 "문의하기" 기능 (폼 + 텔레그램 링크)
- 마음에 드는 서비스는 쉽게 분리해서 별도 론칭 가능한 구조

### 디자인 원칙
- 기존 미니멀 디자인 유지 (Natural.co / Raindrop.io 스타일)
- 모노크롬 색상 체계
- 반응형 레이아웃

---

## 현재 구조

```
when1life/
├── / (홈)              → 클립 목록 (HomeClient)
├── /clips/[id]         → 클립 상세
├── /admin              → 관리자 페이지
└── /auth/callback      → 인증 콜백
```

---

## 목표 구조

```
when1life/
├── / (홈)              → 포트폴리오 메인 (3개 서비스 카드)
├── /clips              → Clipper 데모 (현재 홈 내용)
├── /clips/[id]         → 클립 상세 (기존 유지)
├── /running            → Running Coach 소개 + 데모
├── /fasting            → Fasting Coach 소개 + 데모
├── /admin              → 관리자 (기존 유지)
└── /auth/callback      → 인증 콜백 (기존 유지)
```

### 새 홈페이지 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  when1life                                      🌙  │
├─────────────────────────────────────────────────────┤
│                                                     │
│           AI-powered personal workflows             │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Clipper  │  │ Running  │  │ Fasting  │          │
│  │          │  │  Coach   │  │  Coach   │          │
│  │ 콘텐츠   │  │ 러닝     │  │ 단식     │          │
│  │ 큐레이션 │  │ 코치     │  │ 코치     │          │
│  │          │  │          │  │          │          │
│  │ [Demo]   │  │ [Demo]   │  │ [Demo]   │          │
│  │ [문의]   │  │ [문의]   │  │ [문의]   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## DB 구조

### Supabase Project: `dotsosqsftympgdescvz` (when1log)

| 워크플로우 | 스키마 | 주요 테이블 | 현재 데이터 |
|-----------|--------|-------------|-------------|
| **Clipper** | `clipper` | Clips, Categories, UserSettings, PendingClips | 3건 |
| **Running Coach** | `public` | Users, RunningLogs, UserGoals, UserTheories, TheoryKnowledge | 48건 |
| **Fasting Coach** | `public` | FastingSessions, FastingNotifications, BodyCompositionLogs, FastingDietTheories, FastingUserGoals, FastingTheoryPresets | 2건 |

### Running Coach 테이블 상세

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|----------|
| Users | 사용자 정보 | chat_id, intervals_athlete_id, is_setup_complete |
| RunningLogs | 러닝 기록 | date, distance_km, duration_min, avg_pace, avg_hr, training_load |
| UserGoals | 목표 설정 | goal, is_active |
| UserTheories | 적용 이론 | theory_name, core_principles |

### Fasting Coach 테이블 상세

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|----------|
| FastingSessions | 단식 세션 | started_at, ended_at, duration_minutes, goal_reached |
| BodyCompositionLogs | 체성분 기록 | weight_kg, body_fat_pct, skeletal_muscle_kg |
| FastingUserGoals | 목표 | target_weight_kg, target_body_fat_pct |
| FastingTheoryPresets | 단식 이론 프리셋 | theory_name, fasting_hours, eating_window_hours |

---

## 구현 계획

### Phase 1: 기존 홈 → /clips 이동

**작업 내용:**
1. `app/clips/page.tsx` 생성 (새 라우트)
2. `app/HomeClient.tsx` → `app/clips/ClipsClient.tsx` 이동
3. 기존 `/clips/[id]` 라우트 유지

**파일 변경:**
- 신규: `app/clips/page.tsx`
- 이동: `app/HomeClient.tsx` → `app/clips/ClipsClient.tsx`

---

### Phase 2: 포트폴리오 홈 생성

**작업 내용:**
1. `app/page.tsx` 완전 교체
2. `components/ServiceCard.tsx` 생성
3. 3개 서비스 카드 표시

**ServiceCard 컴포넌트:**
```tsx
interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  demoLink: string;
  status: 'active' | 'beta' | 'coming';
}
```

---

### Phase 3: Running Coach 페이지

**작업 내용:**
1. `app/running/page.tsx` 생성
2. `lib/running.ts` 생성 (데이터 fetching)
3. 서비스 소개 + 실제 데이터 대시보드

**대시보드 표시 항목:**
- 주간 러닝 통계 (거리, 시간, 평균 페이스)
- 현재 목표
- 최근 활동 목록 (최근 5건)

**lib/running.ts 함수:**
```typescript
// 주간 통계
export async function getWeeklyStats()

// 최근 활동
export async function getRecentActivities(limit: number)

// 현재 목표
export async function getCurrentGoal()
```

---

### Phase 4: Fasting Coach 페이지

**작업 내용:**
1. `app/fasting/page.tsx` 생성
2. `lib/fasting.ts` 생성 (데이터 fetching)
3. 서비스 소개 + 실제 데이터 대시보드

**대시보드 표시 항목:**
- 현재/최근 단식 세션
- 최근 체성분 기록
- 적용 중인 단식 이론

**lib/fasting.ts 함수:**
```typescript
// 최근 단식 세션
export async function getRecentSessions(limit: number)

// 최근 체성분
export async function getLatestBodyComposition()

// 현재 목표
export async function getCurrentGoal()
```

---

### Phase 5: 문의하기 기능

**작업 내용:**
1. `components/ContactSection.tsx` 생성
2. 각 서비스 페이지 하단에 추가

**ContactSection 기능:**
- 간단한 문의 폼 (이름, 이메일, 메시지)
- 텔레그램 DM 링크 버튼
- 폼 제출 → 이메일로 수신

**이메일 수신 옵션:**
- Option A: Supabase Edge Function + Resend
- Option B: Formspree (외부 서비스)
- Option C: 텔레그램 링크만 (폼 없이)

---

## 서비스 분리 용이성 설계

### 설계 원칙
1. **독립적 라우트**: 각 서비스는 `/[service]/*` 구조
2. **독립적 lib**: `lib/[service].ts`로 데이터 로직 분리
3. **독립적 컴포넌트**: `components/[service]/` (필요시)
4. **환경변수 분리 가능**: 서비스별 설정

### 분리 시나리오 (예: Running Coach)
```bash
# 필요 파일만 복사
app/running/* → 새 프로젝트
lib/running.ts → 새 프로젝트
components/running/* → 새 프로젝트

# 공통 파일 (수정 필요)
lib/supabase.ts
components/layout/*
app/globals.css
```

---

## 파일 목록

### 신규 생성
| 파일 | 설명 |
|------|------|
| `app/clips/page.tsx` | Clipper 메인 페이지 |
| `app/clips/ClipsClient.tsx` | Clipper 클라이언트 컴포넌트 |
| `app/running/page.tsx` | Running Coach 페이지 |
| `app/fasting/page.tsx` | Fasting Coach 페이지 |
| `lib/running.ts` | Running Coach 데이터 함수 |
| `lib/fasting.ts` | Fasting Coach 데이터 함수 |
| `components/ServiceCard.tsx` | 서비스 카드 컴포넌트 |
| `components/ContactSection.tsx` | 문의하기 컴포넌트 |

### 수정
| 파일 | 변경 내용 |
|------|----------|
| `app/page.tsx` | 완전 교체 (포트폴리오 홈) |

### 삭제
| 파일 | 사유 |
|------|------|
| `app/HomeClient.tsx` | `app/clips/ClipsClient.tsx`로 이동 |

---

## 구현 순서

| 순서 | 작업 | 예상 파일 |
|-----|------|----------|
| 1 | 기존 홈 → /clips 이동 | app/clips/page.tsx, ClipsClient.tsx |
| 2 | 포트폴리오 홈 생성 | app/page.tsx |
| 3 | ServiceCard 컴포넌트 | components/ServiceCard.tsx |
| 4 | Running Coach 페이지 | app/running/page.tsx, lib/running.ts |
| 5 | Fasting Coach 페이지 | app/fasting/page.tsx, lib/fasting.ts |
| 6 | ContactSection 컴포넌트 | components/ContactSection.tsx |
| 7 | (선택) 이메일 수신 설정 | Edge Function 또는 외부 서비스 |

---

## 검증 방법

### 빌드 확인
```bash
npm run build
```

### 라우팅 확인
| URL | 예상 결과 |
|-----|----------|
| `/` | 포트폴리오 홈 (3개 서비스 카드) |
| `/clips` | Clipper 데모 (기존 홈 내용) |
| `/clips/[id]` | 클립 상세 (기존 유지) |
| `/running` | Running Coach 페이지 |
| `/fasting` | Fasting Coach 페이지 |
| `/admin` | 관리자 (기존 유지) |

### 데이터 확인
- [ ] Clipper: 클립 목록 표시
- [ ] Running Coach: 주간 통계, 최근 활동 표시
- [ ] Fasting Coach: 최근 세션, 체성분 표시

### 반응형 확인
- [ ] 데스크톱: 3열 카드 레이아웃
- [ ] 태블릿: 2열 카드 레이아웃
- [ ] 모바일: 1열 카드 레이아웃

---

## 참고 문서

- [CLIPPER_WEB_PLAN.md](./CLIPPER_WEB_PLAN.md) - 기존 Clipper 웹 UI 계획
