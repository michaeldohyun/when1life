import { clipperDb } from '@/lib/supabase';
import { LinkifiedContent } from '@/components/ui/LinkifiedContent';

interface AboutPage {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

async function getAboutContent(): Promise<AboutPage | null> {
  const { data, error } = await clipperDb
    .from('AboutPage')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching about page:', error);
    return null;
  }

  return data as AboutPage;
}

export default async function AboutPage() {
  const about = await getAboutContent();

  if (!about) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-lg font-medium text-foreground mb-4">About</h1>
        <p className="text-sm text-muted-foreground">Content not available.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-lg font-medium text-foreground mb-6">{about.title}</h1>
      <div className="prose prose-sm max-w-none">
        {about.content.split('\n').map((paragraph, index) => (
          paragraph.trim() ? (
            <LinkifiedContent
              key={index}
              text={paragraph}
              className="text-sm text-foreground mb-4 leading-relaxed"
            />
          ) : (
            <br key={index} />
          )
        ))}
      </div>
    </div>
  );
}
