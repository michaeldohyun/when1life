'use client';

import { Clip, CATEGORY_NAME } from '@/lib/supabase';
import { Lightbulb, BookOpen, Quote, FileText } from 'lucide-react';

interface ClipCardProps {
  clip: Clip;
  view?: 'grid' | 'list';
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  idea: Lightbulb,
  article: BookOpen,
  quote: Quote,
};

const CATEGORY_COLORS: Record<string, string> = {
  idea: 'var(--category-idea)',
  article: 'var(--category-article)',
  quote: 'var(--category-quote)',
};

export function ClipCard({ clip, view = 'grid' }: ClipCardProps) {
  const categoryName = clip.category ? CATEGORY_NAME[clip.category] : '미분류';
  const CategoryIcon = clip.category ? CATEGORY_ICONS[clip.category] : FileText;
  const categoryColor = clip.category ? CATEGORY_COLORS[clip.category] : 'var(--text-tertiary)';

  const formattedDate = new Date(clip.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (view === 'list') {
    return (
      <article className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border)] p-4 hover:border-[var(--accent)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2">
              {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" style={{ color: categoryColor }} />}
              <span className="text-xs font-medium" style={{ color: categoryColor }}>
                {categoryName}
              </span>
            </div>
            <p className="text-[var(--text-primary)] whitespace-pre-wrap break-words line-clamp-2">
              {clip.content}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-tertiary)]">
              <time>{formattedDate}</time>
              {clip.source && <span className="truncate max-w-[200px]">· {clip.source}</span>}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] p-6 hover:border-[var(--accent)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer">
      {/* Category Badge */}
      <div className="flex items-center gap-1.5 mb-4">
        {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" style={{ color: categoryColor }} />}
        <span className="text-xs font-medium" style={{ color: categoryColor }}>
          {categoryName}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed">
          {clip.content}
        </p>
      </div>

      {/* Summary */}
      {clip.summary && (
        <p className="text-sm text-[var(--text-secondary)] mt-4 italic leading-relaxed border-l-2 border-[var(--border)] pl-3">
          {clip.summary}
        </p>
      )}

      {/* Source */}
      {clip.source && (
        <p className="text-sm text-[var(--text-tertiary)] mt-3 truncate">
          — {clip.source}
        </p>
      )}

      {/* Tags */}
      {clip.tags && clip.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {clip.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs rounded-md hover:bg-[var(--accent-light)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Image */}
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

      {/* Footer */}
      <div className="flex items-center justify-end mt-5 pt-4 border-t border-[var(--border-light)]">
        <time className="text-xs text-[var(--text-tertiary)]">
          {formattedDate}
        </time>
      </div>
    </article>
  );
}
