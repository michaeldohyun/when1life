import { clipperDb, Clip, CATEGORY_EMOJI, CATEGORY_NAME } from '@/lib/supabase';
import { Lightbulb, BookOpen, MessageCircle, Grid, List } from 'lucide-react';

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

function ClipCard({ clip }: { clip: Clip }) {
  const emoji = clip.category ? CATEGORY_EMOJI[clip.category] : '📝';
  const categoryName = clip.category ? CATEGORY_NAME[clip.category] : '미분류';

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl flex-shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 whitespace-pre-wrap break-words">
            {clip.content}
          </p>
        </div>
      </div>

      {clip.summary && (
        <p className="text-sm text-gray-500 mt-3 pl-9 italic">
          {clip.summary}
        </p>
      )}

      {clip.source && (
        <p className="text-sm text-gray-400 mt-2 pl-9">
          — {clip.source}
        </p>
      )}

      {clip.tags && clip.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pl-9">
          {clip.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {clip.image_url && (
        <div className="mt-3 pl-9">
          <img
            src={clip.image_url}
            alt="클립 이미지"
            className="rounded-lg max-h-64 object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pl-9 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          {categoryName}
        </span>
        <time className="text-xs text-gray-400">
          {new Date(clip.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </div>
    </article>
  );
}

export default async function Home() {
  const clips = await getClips();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              When1.Life
            </h1>
            <nav className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                <Grid size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
                <List size={20} />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium whitespace-nowrap">
              📋 전체
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Lightbulb size={16} className="text-yellow-500" />
              아이디어
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
              <BookOpen size={16} className="text-blue-500" />
              읽을거리
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
              <MessageCircle size={16} className="text-purple-500" />
              명언
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {clips.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              저장된 클립이 없습니다.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              텔레그램 봇을 통해 클립을 저장해보세요!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-gray-400">
            Powered by Clipper Bot
          </p>
        </div>
      </footer>
    </div>
  );
}
