import { clipperDb, Clip } from '@/lib/supabase';
import { HomeClient } from './HomeClient';

async function getClips(category?: string): Promise<Clip[]> {
  let query = clipperDb
    .from('Clips')
    .select('*')
    .order('created_at', { ascending: false });

  if (category && ['idea', 'article', 'quote'].includes(category)) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching clips:', error);
    return [];
  }

  return data || [];
}

interface PageProps {
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const clips = await getClips(params.category);

  return <HomeClient clips={clips} category={params.category} />;
}
