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
    <div className="min-h-screen flex flex-col">
      <Header
        view={view}
        onViewChange={setView}
        onSearch={setSearchQuery}
        title={pageTitle}
      />

      <main className="flex-1 pt-12 px-5 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {pageTitle}
            </h1>
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
              {filteredClips.length}개
            </span>
          </div>
          {searchQuery && (
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              검색: &quot;{searchQuery}&quot;
            </p>
          )}
        </div>

        {/* Content */}
        {view === 'grid' ? (
          <ClipGrid clips={filteredClips} />
        ) : (
          <ClipList clips={filteredClips} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-light)] mt-auto">
        <div className="px-6 py-4 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">
            Powered by Clipper Bot
          </p>
        </div>
      </footer>
    </div>
  );
}
