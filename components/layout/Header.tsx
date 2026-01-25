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
    <header className="fixed top-0 right-0 left-0 lg:left-60 h-14 bg-[var(--bg-primary)] border-b border-[var(--border)] z-30">
      <div className="h-full px-4 flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={open}
          className="p-2 -ml-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] lg:hidden"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title (Mobile) */}
        <h1 className="font-semibold text-[var(--text-primary)] lg:hidden">
          {title || 'When1.Life'}
        </h1>

        {/* Search Bar */}
        <div className="hidden sm:block flex-1 max-w-md">
          <SearchBar onSearch={onSearch} placeholder="클립 검색..." />
        </div>

        {/* Spacer */}
        <div className="flex-1 sm:flex-none" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={onViewChange} />
          <div className="hidden lg:block">
            <ThemeToggleIcon />
          </div>
        </div>
      </div>
    </header>
  );
}
