import { clipperDb, Clip } from '@/lib/supabase';
import { ClipsClient } from './ClipsClient';

async function getClips(): Promise<Clip[]> {
  const { data, error } = await clipperDb
    .from('Clips')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clips:', error);
    return [];
  }

  return data || [];
}

export default async function ClipsPage() {
  const clips = await getClips();

  return <ClipsClient clips={clips} />;
}
