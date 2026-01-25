'use client';

import { Clip, CATEGORY_NAME } from '@/lib/supabase';

interface ClipCardProps {
  clip: Clip;
  view?: 'grid' | 'list';
}

export function ClipCard({ clip, view = 'grid' }: ClipCardProps) {
  const categoryName = clip.category ? CATEGORY_NAME[clip.category] : '미분류';

  const formattedDate = new Date(clip.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (view === 'list') {
    return (
      <article className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border)] p-4 hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[var(--text-primary)] whitespace-pre-wrap break-words line-clamp-2">
              {clip.content}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-tertiary)]">
              <span>{categoryName}</span>
              <time>{formattedDate}</time>
              {clip.source && <span>- {clip.source}</span>}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] p-6 hover:border-[var(--accent)] hover:shadow-md transition-all duration-200 group">
      <div className="mb-4">
        <p className="text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed">
          {clip.content}
        </p>
      </div>

      {clip.summary && (
        <p className="text-sm text-[var(--text-secondary)] mt-4 italic leading-relaxed">
          {clip.summary}
        </p>
      )}

      {clip.source && (
        <p className="text-sm text-[var(--text-tertiary)] mt-3">
          - {clip.source}
        </p>
      )}

      {clip.tags && clip.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {clip.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full hover:bg-[var(--accent-light)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {clip.image_url && (
        <div className="mt-4">
          <div className="relative rounded-lg overflow-hidden max-h-64">
            <img
              src={clip.image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border)]">
        <span className="text-xs text-[var(--text-tertiary)]">
          {categoryName}
        </span>
        <time className="text-xs text-[var(--text-tertiary)]">
          {formattedDate}
        </time>
      </div>
    </article>
  );
}
