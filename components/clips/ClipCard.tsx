'use client';

import { Clip, CATEGORY_NAME } from '@/lib/supabase';
import { Lightbulb, BookOpen, Quote, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  idea: 'text-category-idea',
  article: 'text-category-article',
  quote: 'text-category-quote',
};

const CATEGORY_BG_COLORS: Record<string, string> = {
  idea: 'bg-category-idea/10',
  article: 'bg-category-article/10',
  quote: 'bg-category-quote/10',
};

export function ClipCard({ clip, view = 'grid' }: ClipCardProps) {
  const categoryName = clip.category ? CATEGORY_NAME[clip.category] : '미분류';
  const CategoryIcon = clip.category ? CATEGORY_ICONS[clip.category] : FileText;
  const categoryColorClass = clip.category ? CATEGORY_COLORS[clip.category] : 'text-muted-foreground';
  const categoryBgClass = clip.category ? CATEGORY_BG_COLORS[clip.category] : 'bg-muted';

  const formattedDate = new Date(clip.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (view === 'list') {
    return (
      <Card className="py-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group">
        <CardContent className="py-0">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md mb-2", categoryBgClass)}>
                {CategoryIcon && <CategoryIcon className={cn("w-3.5 h-3.5", categoryColorClass)} />}
                <span className={cn("text-xs font-medium", categoryColorClass)}>
                  {categoryName}
                </span>
              </div>
              <p className="text-foreground whitespace-pre-wrap break-words line-clamp-2">
                {clip.content}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <time>{formattedDate}</time>
                {clip.source && <span className="truncate max-w-[200px]">· {clip.source}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
      <CardHeader className="pb-2">
        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md w-fit", categoryBgClass)}>
          {CategoryIcon && <CategoryIcon className={cn("w-3.5 h-3.5", categoryColorClass)} />}
          <span className={cn("text-xs font-medium", categoryColorClass)}>
            {categoryName}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content */}
        <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
          {clip.content}
        </p>

        {/* Summary */}
        {clip.summary && (
          <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-border pl-3">
            {clip.summary}
          </p>
        )}

        {/* Source */}
        {clip.source && (
          <p className="text-sm text-muted-foreground truncate">
            — {clip.source}
          </p>
        )}

        {/* Tags */}
        {clip.tags && clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {clip.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-md hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Image */}
        {clip.image_url && (
          <div className="relative rounded-lg overflow-hidden max-h-64">
            <img
              src={clip.image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4">
        <time className="text-xs text-muted-foreground ml-auto">
          {formattedDate}
        </time>
      </CardFooter>
    </Card>
  );
}
