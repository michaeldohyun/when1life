'use client';

import { useState, useMemo } from 'react';
import { Clip, CATEGORY_NAME } from '@/lib/supabase';
import { ClipGrid } from '@/components/clips/ClipGrid';
import { ClipList } from '@/components/clips/ClipList';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle } from '@/components/ui/ViewToggle';

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
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {pageTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredClips.length}개의 클립
            {searchQuery && ` · "${searchQuery}" 검색 결과`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchBar onSearch={setSearchQuery} placeholder="클립 검색..." />
          </div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Content */}
      {view === 'grid' ? (
        <ClipGrid clips={filteredClips} />
      ) : (
        <ClipList clips={filteredClips} />
      )}
    </div>
  );
}
