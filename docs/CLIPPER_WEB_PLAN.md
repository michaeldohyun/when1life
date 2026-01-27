# 클립퍼 웹 UI 프로젝트 계획

> 버전: 1.0
> 작성일: 2026-01-20
> 상태: 계획

---

## 📋 목차

1. [개요](#개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [설정 가이드](#설정-가이드)
5. [개발 가이드](#개발-가이드)
6. [배포 가이드](#배포-가이드)

---

## 개요

### 목적
텔레그램 클립퍼 봇에 저장된 데이터를 웹에서 조회하고 관리할 수 있는 UI 제공

### 핵심 기능
| 기능 | 설명 |
|------|------|
| 클립 조회 | 저장된 텍스트/이미지/링크 목록 표시 |
| 카테고리 필터 | 💡 아이디어, 📚 읽을거리, 💬 명언 필터링 |
| 태그 필터 | 해시태그 기반 필터링 |
| 검색 | 제목/내용/출처 검색 |
| 뷰 전환 | 그리드/리스트 뷰 지원 |
| 반응형 | 모바일/태블릿/데스크톱 대응 |

### 데이터 소스
- **Supabase Project**: `rwtqwkrqgxdmfmxxwsvf` (miclipper)
- **테이블**: `Clips`, `Categories`
- **Storage**: `clip-images` 버킷

---

## 기술 스택

### 프론트엔드
| 기술 | 용도 | 버전 |
|------|------|------|
| Next.js | React 프레임워크 | 14.x (App Router) |
| Tailwind CSS | 스타일링 | 3.x |
| Lucide React | 아이콘 | latest |

### 백엔드 (기존 인프라 활용)
| 기술 | 용도 |
|------|------|
| Supabase | 데이터베이스, 인증, Storage |
| @supabase/supabase-js | JavaScript 클라이언트 |

### 배포
| 서비스 | 용도 |
|------|------|
| GitHub | 소스 코드 버전 관리 |
| Vercel | 호스팅 및 CI/CD (Next.js 제작사) |
| 커스텀 도메인 | 사용자 도메인 연결 |

---

## 프로젝트 구조

```
clipper-web/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지 (/)
│   ├── globals.css         # Tailwind CSS
│   └── clips/
│       └── [category]/
│           └── page.tsx    # 카테고리별 페이지
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── Clip/
│   │   ├── ClipCard.tsx
│   │   ├── ClipListItem.tsx
│   │   └── ClipGrid.tsx
│   └── UI/
│       ├── SearchInput.tsx
│       ├── CategoryFilter.tsx
│       └── ViewToggle.tsx
├── lib/
│   └── supabase.ts
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
└── tailwind.config.ts
```

---

## 설정 가이드

### 1단계: 프로젝트 생성

```bash
# 프로젝트 디렉토리로 이동
cd /Users/michael/mi-projects

# Next.js 프로젝트 생성
npx create-next-app@latest clipper-web

# 설정 선택:
# ✔ Would you like to use TypeScript? → Yes
# ✔ Would you like to use ESLint? → Yes
# ✔ Would you like to use Tailwind CSS? → Yes
# ✔ Would you like to use `src/` directory? → No
# ✔ Would you like to use App Router? → Yes
# ✔ Would you like to customize the default import alias? → No
```

### 2단계: 추가 패키지 설치

```bash
cd clipper-web

# Supabase 클라이언트
npm install @supabase/supabase-js

# 아이콘 라이브러리
npm install lucide-react
```

### 3단계: 환경 변수 설정

**.env.local** (Git에 포함되지 않음)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://rwtqwkrqgxdmfmxxwsvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

> ⚠️ **중요**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 프론트엔드에 노출하지 마세요!
> 웹 앱에서는 `anon key`만 사용합니다.

**Anon Key 확인 방법:**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → Settings → API
3. `anon` `public` 키 복사

### 4단계: Supabase 클라이언트 설정

**lib/supabase.ts**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 5단계: Git 저장소 설정

```bash
# create-next-app이 자동으로 git init 수행
# .gitignore도 자동 생성됨 (.env.local 포함)

# 초기 커밋
git add .
git commit -m "Initial commit: Clipper Web UI setup"
```

### 6단계: GitHub 저장소 생성 및 연결

```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/clipper-web.git
git branch -M main
git push -u origin main
```

---

## 개발 가이드

### 로컬 개발 서버 실행

```bash
npm run dev
# http://localhost:3000 에서 확인
```

### 핵심 코드 예시

**app/page.tsx** (메인 페이지)
```tsx
import { supabase } from '@/lib/supabase';
import ClipGrid from '@/components/Clip/ClipGrid';

export default async function Home() {
  const { data: clips } = await supabase
    .from('Clips')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">내 클립</h1>
      <ClipGrid clips={clips || []} />
    </main>
  );
}
```

**components/Clip/ClipCard.tsx**
```tsx
interface ClipCardProps {
  clip: {
    id: string;
    content: string;
    content_type: string;
    category: string | null;
    source: string | null;
    image_url: string | null;
    tags: string[] | null;
    created_at: string;
  };
}

export default function ClipCard({ clip }: ClipCardProps) {
  const categoryEmoji = {
    idea: '💡',
    article: '📚',
    quote: '💬',
  }[clip.category || ''] || '📝';

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xl">{categoryEmoji}</span>
        <p className="text-gray-800 flex-1">{clip.content}</p>
      </div>

      {clip.source && (
        <p className="text-sm text-gray-500 mt-2">— {clip.source}</p>
      )}

      {clip.tags && clip.tags.length > 0 && (
        <div className="flex gap-1 mt-3">
          {clip.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 카테고리 매핑

```typescript
const CATEGORIES = {
  all: { name: '전체', emoji: '📋' },
  idea: { name: '아이디어', emoji: '💡' },
  article: { name: '읽을거리', emoji: '📚' },
  quote: { name: '명언', emoji: '💬' },
};
```

### RLS (Row Level Security) 설정

웹에서 데이터를 조회하려면 Supabase RLS 정책 설정이 필요합니다.

```sql
-- Clips 테이블 읽기 허용 (공개 조회)
CREATE POLICY "Public read access for Clips"
ON "Clips" FOR SELECT
USING (true);

-- 또는 특정 chat_id만 허용 (인증 구현 시)
CREATE POLICY "Owner read access for Clips"
ON "Clips" FOR SELECT
USING (chat_id = current_setting('request.jwt.claims')::json->>'chat_id');
```

> **참고**: 인증 없이 공개 조회를 허용할지, 인증 후 본인 데이터만 조회할지 결정 필요

---

## 배포 가이드

### 1단계: Vercel 계정 및 프로젝트 설정

1. [vercel.com](https://vercel.com) 가입 (GitHub 연동 추천)
2. "Add New Project" 클릭
3. GitHub 저장소 선택 (`clipper-web`)
4. Framework Preset: `Next.js` 자동 감지

### 2단계: 환경 변수 설정 (Vercel)

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rwtqwkrqgxdmfmxxwsvf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_anon_key` |

> 환경 변수 추가 후 재배포 필요 (Deployments → 최근 배포 → Redeploy)

### 3단계: 빌드 설정

Vercel이 Next.js를 자동 감지하여 설정합니다.

| 설정 | 값 (자동) |
|------|-----|
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

### 4단계: 커스텀 도메인 연결

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. "Add" 클릭 후 도메인 입력 (예: `clipper.yourdomain.com`)
3. DNS 설정:

**CNAME 레코드** (서브도메인용)
```
Type: CNAME
Name: clipper (또는 원하는 서브도메인)
Value: cname.vercel-dns.com
```

**A 레코드** (루트 도메인용)
```
Type: A
Name: @
Value: 76.76.21.21
```

4. SSL 인증서 자동 발급 (Vercel이 처리)

### 5단계: 자동 배포 확인

GitHub에 push하면 Vercel이 자동으로 빌드 및 배포합니다.

```bash
git add .
git commit -m "Update: new feature"
git push origin main
# → Vercel 자동 배포 시작
```

---

## 체크리스트

### 개발 준비
- [ ] Node.js 18+ 설치 확인
- [ ] Next.js 프로젝트 생성 (`create-next-app`)
- [ ] Supabase 클라이언트 설치
- [ ] 환경 변수 설정 (`.env.local`)

### Git/GitHub
- [ ] Git 저장소 초기화 (자동)
- [ ] .gitignore 확인 (`.env.local` 포함됨)
- [ ] GitHub 저장소 생성
- [ ] 원격 저장소 연결 및 push

### Supabase
- [ ] Anon Key 확인 (Dashboard → Settings → API)
- [ ] RLS 정책 설정
- [ ] 테스트 쿼리 확인

### Vercel 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 첫 배포 성공 확인
- [ ] 커스텀 도메인 연결
- [ ] HTTPS 확인

---

## 참고 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [example.jsx](./example.jsx) - 참고용 UI 예제 코드
