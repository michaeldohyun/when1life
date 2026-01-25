'use client';

import { Clip } from '@/lib/supabase';
import { ClipCard } from './ClipCard';
import { Inbox } from 'lucide-react';

interface ClipGridProps {
  clips: Clip[];
}

export function ClipGrid({ clips }: ClipGridProps) {
  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-[var(--text-tertiary)]" />
        </div>
        <p className="text-[var(--text-secondary)] text-base font-medium">
          저장된 클립이 없습니다
        </p>
        <p className="text-[var(--text-tertiary)] text-sm mt-1.5">
          텔레그램 봇을 통해 클립을 저장해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} view="grid" />
      ))}
    </div>
  );
}
