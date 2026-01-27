'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Clip } from '@/lib/supabase';
import { ClipGrid } from '@/components/clips/ClipGrid';
import { ClipList } from '@/components/clips/ClipList';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle } from '@/components/ui/ViewToggle';

type ViewMode = 'grid' | 'list';

interface ClipsClientProps {
  clips: Clip[];
}

export function ClipsClient({ clips }: ClipsClientProps) {
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
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/workflows"
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-medium text-foreground">Clips</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Content curation powered by AI
          </p>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={setSearchQuery} placeholder="Search..." />
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Count */}
      {searchQuery && (
        <p className="text-xs text-muted-foreground mb-4">
          {filteredClips.length} results
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
            {searchQuery ? 'No results found' : 'No clips saved yet'}
          </p>
        </div>
      )}
    </div>
  );
}
