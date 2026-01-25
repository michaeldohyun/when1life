'use client';

import { useState, useMemo } from 'react';
import { Clip, CATEGORY_NAME } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { ClipGrid } from '@/components/clips/ClipGrid';
import { ClipList } from '@/components/clips/ClipList';

type ViewMode = 'grid' | 'list';

interface HomeClientProps {
  clips: Clip[];
  category?: string;
}

export function HomeClient({ clips, category }: HomeClientProps) {
  const [view, setView] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const pageTitle = category ? CATEGORY_NAME[category] || '전체' : '전체 클립';

  const filteredClips = useMemo(() => {
    if (!searchQuery.trim()) return clips;

    const query = searchQuery.toLowerCase();
    return clips.filter(clip =>
      clip.content.toLowerCase().includes(query) ||
      clip.summary?.toLowerCase().includes(query) ||
      clip.source?.toLowerCase().includes(query) ||
      clip.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [clips, searchQuery]);

  return (
    <div className="min-h-screen">
      <Header
        view={view}
        onViewChange={setView}
        onSearch={setSearchQuery}
        title={pageTitle}
      />

      <main className="pt-14 px-4 sm:px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {pageTitle}
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            {filteredClips.length}개의 클립
            {searchQuery && ` (검색: "${searchQuery}")`}
          </p>
        </div>

        {/* Content */}
        {view === 'grid' ? (
          <ClipGrid clips={filteredClips} />
        ) : (
          <ClipList clips={filteredClips} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-auto">
        <div className="px-6 py-6 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">
            Powered by Clipper Bot
          </p>
        </div>
      </footer>
    </div>
  );
}
