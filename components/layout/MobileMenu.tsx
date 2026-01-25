'use client';

import { Menu } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

export function MobileMenuButton() {
  const { open } = useSidebar();

  return (
    <button
      onClick={open}
      className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] lg:hidden"
      aria-label="메뉴 열기"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
