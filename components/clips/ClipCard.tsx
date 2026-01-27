'use client';

import Link from 'next/link';
import { Clip } from '@/lib/supabase';
import { parseUrls } from '@/lib/utils';

interface ClipCardProps {
  clip: Clip;
  view?: 'grid' | 'list';
}

function LinkifiedText({ text }: { text: string }) {
  const parts = parseUrls(text);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'url') {
          return (
            <a
              key={index}
              href={part.content}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {part.content}
            </a>
          );
        }
        return part.content;
      })}
    </>
  );
}

export function ClipCard({ clip, view = 'grid' }: ClipCardProps) {
  const formattedDate = new Date(clip.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (view === 'list') {
    return (
      <div className="py-3 border-b hover:bg-muted/30 transition-colors">
        <div className="flex items-baseline justify-between gap-4">
          <Link href={`/clips/${clip.id}`} className="text-sm text-foreground truncate flex-1 hover:text-muted-foreground transition-colors">
            {clip.content}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            {clip.source && <span className="truncate max-w-[120px]">{clip.source}</span>}
            {clip.source && <span>&middot;</span>}
            <time>{formattedDate}</time>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md hover:border-foreground/20 transition-colors h-full flex flex-col">
      <p className="text-sm text-foreground leading-relaxed line-clamp-3 flex-1">
        <LinkifiedText text={clip.content} />
      </p>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t text-xs text-muted-foreground">
        {clip.source && (
          <>
            <span className="truncate max-w-[150px]">{clip.source}</span>
            <span>&middot;</span>
          </>
        )}
        <time>{formattedDate}</time>
        <Link
          href={`/clips/${clip.id}`}
          className="ml-auto hover:text-foreground transition-colors"
        >
          더보기
        </Link>
      </div>
    </div>
  );
}
