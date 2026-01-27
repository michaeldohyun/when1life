import { clipperDb, Clip } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { LinkifiedContent } from '@/components/ui/LinkifiedContent';

interface ClipDetailPageProps {
  params: Promise<{ id: string }>;
}

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

  const formattedDate = new Date(clip.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        돌아가기
      </Link>

      <article className="space-y-6">
        {/* Main Content */}
        <LinkifiedContent
          text={clip.content}
          className="text-base leading-relaxed whitespace-pre-wrap break-words"
        />

        {/* Summary */}
        {clip.summary && (
          <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-4">
            {clip.summary}
          </p>
        )}

        {/* Image */}
        {clip.image_url && (
          <div className="rounded-md overflow-hidden border">
            <img
              src={clip.image_url}
              alt=""
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {clip.tags && clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {clip.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 pt-6 border-t text-xs text-muted-foreground">
          <time>{formattedDate}</time>

          {clip.source && (
            <>
              <span>&middot;</span>
              {isValidUrl(clip.source) ? (
                <a
                  href={clip.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {clip.source}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span>{clip.source}</span>
              )}
            </>
          )}
        </div>
      </article>
    </div>
  );
}
