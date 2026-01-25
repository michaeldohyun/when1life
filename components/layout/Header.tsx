'use client';

import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { ThemeToggleIcon } from '@/components/ui/ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

type ViewMode = 'grid' | 'list';

interface HeaderProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onSearch?: (query: string) => void;
  title?: string;
}

export function Header({ view, onViewChange, onSearch, title }: HeaderProps) {
  return (
    <header className="sticky top-0 h-14 bg-background/80 backdrop-blur-md border-b z-30">
      <div className="h-full px-4 flex items-center gap-3">
        {/* Mobile Menu Button */}
        <SidebarTrigger className="md:hidden" />

        <Separator orientation="vertical" className="h-6 md:hidden" />

        {/* Title (Mobile) */}
        <h1 className="font-medium text-sm text-foreground md:hidden truncate">
          {title || 'When1.Life'}
        </h1>

        {/* Search Bar */}
        <div className="hidden sm:block flex-1 max-w-sm">
          <SearchBar onSearch={onSearch} placeholder="클립 검색..." />
        </div>

        {/* Spacer */}
        <div className="flex-1 sm:flex-none" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ViewToggle view={view} onViewChange={onViewChange} />
          <div className="hidden md:block">
            <ThemeToggleIcon />
          </div>
        </div>
      </div>
    </header>
  );
}
