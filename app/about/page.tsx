import { clipperDb } from '@/lib/supabase';
import { LinkifiedContent } from '@/components/ui/LinkifiedContent';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// 동적 렌더링 강제 (DB 데이터 실시간 반영)
export const dynamic = 'force-dynamic';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface AboutPageData {
  id: string;
  title: string;
  content: string;
  profile_image_url: string | null;
  timeline: TimelineItem[];
  updated_at: string;
}

async function getAboutContent(): Promise<AboutPageData | null> {
  const { data, error } = await clipperDb
    .from('AboutPage')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching about page:', error);
    return null;
  }

  return data as AboutPageData;
}

export default async function AboutPage() {
  const about = await getAboutContent();

  if (!about) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-medium text-foreground">About</h1>
        </div>
        <p className="text-sm text-muted-foreground">Content not available.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-medium text-foreground">{about.title}</h1>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        {about.profile_image_url && (
          <div className="flex-shrink-0">
            <img
              src={about.profile_image_url}
              alt="Profile"
              className="w-24 h-24 object-cover rounded-full border border-border"
            />
          </div>
        )}
        <div className="flex-1">
          {about.content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <LinkifiedContent
                key={index}
                text={paragraph}
                className="text-sm text-foreground mb-3 leading-relaxed"
              />
            ) : (
              <br key={index} />
            )
          ))}
        </div>
      </div>

      {/* Timeline */}
      {about.timeline && about.timeline.length > 0 && (
        <div className="border-t border-border pt-10">
          <h2 className="text-sm font-medium text-foreground mb-6">Timeline</h2>
          <div className="space-y-6">
            {about.timeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-16">
                  <span className="text-xs text-muted-foreground font-medium">
                    {item.year}
                  </span>
                </div>
                <div className="flex-1 border-l border-border pl-4 pb-2">
                  <p className="text-sm text-foreground font-medium">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
