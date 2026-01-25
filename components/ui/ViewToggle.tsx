'use client';

import { LayoutGrid, List } from 'lucide-react';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-md transition-colors ${
          view === 'grid'
            ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        }`}
        aria-label="그리드 뷰"
        aria-pressed={view === 'grid'}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-md transition-colors ${
          view === 'list'
            ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        }`}
        aria-label="리스트 뷰"
        aria-pressed={view === 'list'}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
