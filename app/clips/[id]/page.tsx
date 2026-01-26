import { clipperDb, Clip, CATEGORY_NAME } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, BookOpen, Quote, FileText, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ClipDetailPageProps {
  params: Promise<{ id: string }>;
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

async function getClip(id: string): Promise<Clip | null> {
  const { data, error } = await clipperDb
    .from('Clips')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Clip;
}

export default async function ClipDetailPage({ params }: ClipDetailPageProps) {
  const { id } = await params;
  const clip = await getClip(id);

  if (!clip) {
    notFound();
  }

  const categoryName = clip.category ? CATEGORY_NAME[clip.category] : '미분류';
  const CategoryIcon = clip.category ? CATEGORY_ICONS[clip.category] : FileText;
  const categoryColorClass = clip.category ? CATEGORY_COLORS[clip.category] : 'text-muted-foreground';
  const categoryBgClass = clip.category ? CATEGORY_BG_COLORS[clip.category] : 'bg-muted';

  const formattedDate = new Date(clip.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        돌아가기
      </Link>

      <Card>
        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Category Badge */}
          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg", categoryBgClass)}>
            {CategoryIcon && <CategoryIcon className={cn("w-4 h-4", categoryColorClass)} />}
            <span className={cn("text-sm font-medium", categoryColorClass)}>
              {categoryName}
            </span>
          </div>

          {/* Main Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap break-words">
              {clip.content}
            </p>
          </div>

          {/* Summary */}
          {clip.summary && (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-2 italic text-muted-foreground">
              {clip.summary}
            </blockquote>
          )}

          {/* Image */}
          {clip.image_url && (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={clip.image_url}
                alt=""
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Source */}
          {clip.source && (
            <div className="flex items-center gap-2 text-muted-foreground">
              {isValidUrl(clip.source) ? (
                <a
                  href={clip.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm underline underline-offset-4">{clip.source}</span>
                </a>
              ) : (
                <span className="text-sm">— {clip.source}</span>
              )}
            </div>
          )}

          {/* Tags */}
          {clip.tags && clip.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {clip.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 pt-4 border-t text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <time>{formattedDate}</time>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
