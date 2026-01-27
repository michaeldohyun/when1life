'use client';

import { useState, useMemo } from 'react';
import { Clip } from '@/lib/supabase';
import { ClipGrid } from '@/components/clips/ClipGrid';
import { ClipList } from '@/components/clips/ClipList';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle } from '@/components/ui/ViewToggle';

type ViewMode = 'grid' | 'list';

interface HomeClientProps {
  clips: Clip[];
}

export function HomeClient({ clips }: HomeClientProps) {
  const [view, setView] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <div className="w-48">
          <SearchBar onSearch={setSearchQuery} placeholder="검색..." />
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Count */}
      {searchQuery && (
        <p className="text-xs text-muted-foreground mb-4">
          {filteredClips.length}개의 결과
        </p>
      )}

      {/* Content */}
      {view === 'grid' ? (
        <ClipGrid clips={filteredClips} />
      ) : (
        <ClipList clips={filteredClips} />
      )}

      {/* Empty state */}
      {filteredClips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            {searchQuery ? '검색 결과가 없습니다' : '저장된 클립이 없습니다'}
          </p>
        </div>
      )}
    </div>
  );
}
