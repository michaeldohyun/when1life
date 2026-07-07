import { generateObject, type UIMessage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey:
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

// 추천 질문이 김도현 커리어 범위를 벗어나지 않도록 앵커가 되는 주제 메뉴
const TOPIC_MENU = `김도현의 커리어 주제 영역:
- 운영 자동화/AX (RPA→REST API 전환, 제안서/모집 자동화, 알림톡)
- AI 에이전트 (Claude Agent SDK, 멀티 에이전트, HITL 안전장치, LLM 워처)
- 데이터 기반 의사결정 (매칭 통념 반증, 30일 데이터 분석)
- 기술 스택 (Supabase/Edge Function, Next.js, SQL 디버깅, No-code→Pro-code)
- 조직/리더십 (매니저 이탈 구간 운영 일원화, 인력 축소 전환 로드맵)
- 외부 파트너/CS (대형 MCN SPOC, 고객 전수 인터뷰)
- 성과 수치 (처리 속도 500배, 알림톡 47배 등)
- 커리어 전환/현재 (1인 사업, 정규직 기회)`;

function textOf(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('');
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    if (!Array.isArray(messages)) {
      return Response.json({ suggestions: [] });
    }

    const transcript = messages
      .slice(-6)
      .map((m) => `${m.role === 'user' ? '담당자' : '어시스턴트'}: ${textOf(m.parts)}`)
      .join('\n');

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        suggestions: z.array(z.string()).length(3),
      }),
      system: `당신은 방문자가 김도현(Michael)에 대해 이어서 물어볼 만한 후속 질문을 제안하는 도우미입니다.
${TOPIC_MENU}

규칙:
- 정확히 3개. 한국어 질문형. 각 28자 이내, 간결하게.
- 직전 대화에서 이미 충분히 답한 주제는 피하고, 아직 안 다룬 영역으로 자연스럽게 넓힌다.
- 위 주제 영역 안에서만 제안한다. 일반 상식/코딩 대행 같은 범위 밖 질문은 금지.`,
      prompt: `지금까지의 대화:\n${transcript}\n\n이 대화에 이어 방문자가 물어볼 만한 후속 질문 3개를 제안하세요.`,
      temperature: 0.7,
    });

    return Response.json(object);
  } catch (error) {
    console.error('about-suggestions error:', error);
    return Response.json({ suggestions: [] });
  }
}
