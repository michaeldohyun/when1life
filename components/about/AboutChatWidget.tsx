'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, Loader2, MessageCircle, X, Sparkles, Mail, Linkedin } from 'lucide-react';

const MAX_QUESTIONS = 5;
const EMAIL = 'michael.dohyun@gmail.com';

const PRESETS = [
  '어떤 일을 해온 분인가요?',
  '가장 임팩트가 컸던 성과는?',
  '어떤 기술 스택을 다루나요?',
];

function messageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('');
}

export function AboutChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/about-chat' }),
  });
  const [input, setInput] = useState('');
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSuggestedFor = useRef<string | null>(null);

  const isBusy = status === 'submitted' || status === 'streaming';
  const started = messages.length > 0;
  const usedQuestions = messages.filter((m) => m.role === 'user').length;
  const remaining = Math.max(0, MAX_QUESTIONS - usedQuestions);
  const limitReached = remaining === 0;
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent('[when1.life] 문의')}&body=${encodeURIComponent('안녕하세요, 사이트에서 질문을 남깁니다.\n\n')}`;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status, dynamicSuggestions, open]);

  // 답변이 끝나면 대화 맥락에 맞는 후속 질문 추천
  useEffect(() => {
    if (status !== 'ready' || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== 'assistant' || lastSuggestedFor.current === last.id) return;
    lastSuggestedFor.current = last.id;

    let cancelled = false;
    setDynamicSuggestions([]);
    fetch('/api/about-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data?.suggestions)) {
          setDynamicSuggestions(data.suggestions.slice(0, 3));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status, messages]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy || limitReached) return;
    sendMessage({ text: trimmed });
    setInput('');
    setDynamicSuggestions([]);
  };

  const chips = started ? dynamicSuggestions : PRESETS;

  return (
    <>
      {/* 패널 */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col bg-background border border-border shadow-xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground leading-none">
                  Michael에게 물어보세요
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  경력·프로젝트·일하는 방식 무엇이든
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <a
                href={mailHref}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="이메일로 문의"
                title="이메일로 문의"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/michaeldohyun"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 메시지 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {!started && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                안녕하세요. 김도현(Michael) 님에 대해 궁금한 걸 물어보시면 자료를
                바탕으로 답해 드립니다.
              </p>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-foreground text-background'
                      : 'bg-muted/40 text-foreground border border-border'
                  }`}
                >
                  {messageText(m.parts) ||
                    (m.role === 'assistant' && isBusy ? '…' : '')}
                </div>
              </div>
            ))}

            {status === 'submitted' && (
              <div className="flex justify-start">
                <div className="px-3 py-2 text-[13px] text-muted-foreground border border-border bg-muted/40 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  생각 중…
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-muted-foreground">
                문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            )}

            {/* 추천 칩 */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {chips.map((q) => (
                  <button
                    key={q}
                    onClick={() => submit(q)}
                    disabled={isBusy}
                    className="px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-colors text-left disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 입력 or 이메일 CTA */}
          {limitReached ? (
            <div className="p-3 border-t border-border text-center">
              <p className="text-[11px] text-muted-foreground mb-2">
                준비된 질문 횟수를 모두 사용했어요. 더 궁금한 점은 이메일로 편하게 물어봐 주세요.
              </p>
              <a
                href={mailHref}
                className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-[13px] bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
                이메일로 이어서 문의하기
              </a>
            </div>
          ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-center gap-2 p-3 border-t border-border"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="무엇이든 물어보세요"
              disabled={isBusy}
              autoComplete="off"
              className="flex-1 px-3 py-2 bg-background border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isBusy || !input.trim()}
              className="flex items-center justify-center w-9 h-9 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-40"
              aria-label="보내기"
            >
              {isBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          )}
          {!limitReached && started && (
            <p className="px-3 pb-2 text-[10px] text-muted-foreground text-right">
              남은 질문 {remaining}회
            </p>
          )}
        </div>
      )}

      {/* 런처 버튼 (아이콘만) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center justify-center w-14 h-14 bg-foreground text-background rounded-full shadow-lg hover:opacity-90 transition-opacity"
        aria-label={open ? '채팅 닫기' : 'Michael에게 물어보기'}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
}
