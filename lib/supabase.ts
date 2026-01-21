import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Clipper 스키마 접근용 클라이언트
export const clipperDb = supabase.schema('clipper');

// Clip 타입 정의
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

// Category 타입 정의
export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
}

// 카테고리 이모지 매핑
export const CATEGORY_EMOJI: Record<string, string> = {
  idea: '💡',
  article: '📚',
  quote: '💬',
};

// 카테고리 이름 매핑
export const CATEGORY_NAME: Record<string, string> = {
  idea: '아이디어',
  article: '읽을거리',
  quote: '명언',
};
