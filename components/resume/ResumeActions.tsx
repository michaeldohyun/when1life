'use client';

import { useState } from 'react';
import { Copy, Check, Printer } from 'lucide-react';

export function ResumeActions({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard 미지원 환경 무시
    }
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-foreground border border-border hover:border-foreground transition-colors"
      >
        <Printer className="w-3.5 h-3.5" />
        PDF 저장 (인쇄)
      </button>
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground border border-border hover:border-foreground hover:text-foreground transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? '복사됨' : 'Markdown 복사'}
      </button>
    </div>
  );
}
