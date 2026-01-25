'use client';

import { Menu } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { ThemeToggleIcon } from '@/components/ui/ThemeToggle';
import { useSidebar } from '@/contexts/SidebarContext';

type ViewMode = 'grid' | 'list';

interface HeaderProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onSearch?: (query: string) => void;
  title?: string;
}

export function Header({ view, onViewChange, onSearch, title }: HeaderProps) {
  const { open } = useSidebar();

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-56 h-12 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-light)] shadow-sm z-30">
      <div className="h-full px-4 flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={open}
          className="p-1.5 -ml-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] lg:hidden transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title (Mobile) */}
        <h1 className="font-medium text-sm text-[var(--text-primary)] lg:hidden truncate">
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
          <div className="hidden lg:block">
            <ThemeToggleIcon />
          </div>
        </div>
      </div>
    </header>
  );
}
