'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onViewChange('grid')}
        className={cn(
          view === 'grid'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="그리드 뷰"
        aria-pressed={view === 'grid'}
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onViewChange('list')}
        className={cn(
          view === 'list'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="리스트 뷰"
        aria-pressed={view === 'list'}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}
