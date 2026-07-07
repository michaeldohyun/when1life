import { clipperDb } from './supabase';
import { mapRow, type WorkProject, type WorkRow } from './work-data';

const COLUMNS =
  'slug,bucket,title,one_liner,tags,problem,comparison,metric,how,evidence,tech,note,sort_order,company,period,role';

export async function getAllProjects(): Promise<WorkProject[]> {
  const { data, error } = await clipperDb
    .from('WorkProject')
    .select(COLUMNS)
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return (data as unknown as WorkRow[]).map(mapRow);
}

export async function getProjectBySlug(slug: string): Promise<WorkProject | null> {
  const { data, error } = await clipperDb
    .from('WorkProject')
    .select(COLUMNS)
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as unknown as WorkRow);
}
