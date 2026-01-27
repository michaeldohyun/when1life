'use client';

import { parseUrls } from '@/lib/utils';

interface LinkifiedContentProps {
  text: string;
  className?: string;
}

export function LinkifiedContent({ text, className }: LinkifiedContentProps) {
  const parts = parseUrls(text);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        if (part.type === 'url') {
          return (
            <a
              key={index}
              href={part.content}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
            >
              {part.content}
            </a>
          );
        }
        return part.content;
      })}
    </p>
  );
}
