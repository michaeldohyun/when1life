'use client';

import { Clip } from '@/lib/supabase';
import { ClipCard } from './ClipCard';

interface ClipGridProps {
  clips: Clip[];
}

export function ClipGrid({ clips }: ClipGridProps) {
  if (clips.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-secondary)] text-lg">
          저장된 클립이 없습니다.
        </p>
        <p className="text-[var(--text-tertiary)] text-sm mt-2">
          텔레그램 봇을 통해 클립을 저장해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} view="grid" />
      ))}
    </div>
  );
}
