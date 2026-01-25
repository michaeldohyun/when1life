import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const clipperDb = supabase.schema('clipper');

export interface Clip {
  id: string;
  chat_id: string;
  content_type: 'text' | 'link' | 'image';
  content: string;
  image_url: string | null;
  source: string | null;
  category: 'idea' | 'article' | 'quote' | null;
  tags: string[] | null;
  summary: string | null;
  ai_processed: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export const CATEGORY_NAME: Record<string, string> = {
  idea: '아이디어',
  article: '읽을거리',
  quote: '명언',
};
