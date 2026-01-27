import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL 정규식 패턴
export const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;

// 텍스트를 URL과 일반 텍스트로 분리
export function parseUrls(text: string): { type: 'text' | 'url'; content: string }[] {
  const parts: { type: 'text' | 'url'; content: string }[] = [];
  let lastIndex = 0;
  let match;

  // 새로운 RegExp 인스턴스 생성 (lastIndex 초기화)
  const regex = new RegExp(URL_REGEX.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    // URL 앞의 텍스트
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    // URL
    parts.push({ type: 'url', content: match[0] });

    lastIndex = match.index + match[0].length;
  }

  // 마지막 남은 텍스트
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
}
