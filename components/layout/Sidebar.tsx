'use client';

import Link from 'next/link';
import { Home, Lightbulb, BookOpen, Quote, Settings, X } from 'lucide-react';
import { NavItem } from '@/components/navigation/NavItem';
import { NavSection } from '@/components/navigation/NavSection';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSidebar } from '@/contexts/SidebarContext';

interface SidebarProps {
  tags?: string[];
}

export function Sidebar({ tags = [] }: SidebarProps) {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-60 bg-[var(--bg-sidebar)] border-r border-[var(--border)]
          flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              When1.Life
            </span>
          </Link>
          <button
            onClick={close}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] lg:hidden"
            aria-label="사이드바 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          <NavSection>
            <NavItem href="/" label="홈" icon={Home} />
          </NavSection>

          <div className="h-px bg-[var(--border)] mx-2 my-2" />

          <NavSection title="카테고리">
            <NavItem href="/?category=idea" label="아이디어" icon={Lightbulb} />
            <NavItem href="/?category=article" label="읽을거리" icon={BookOpen} />
            <NavItem href="/?category=quote" label="명언" icon={Quote} />
          </NavSection>

          {tags.length > 0 && (
            <>
              <div className="h-px bg-[var(--border)] mx-2 my-2" />
              <NavSection title="태그">
                {tags.slice(0, 10).map((tag) => (
                  <NavItem key={tag} href={`/?tag=${tag}`} label={`#${tag}`} />
                ))}
              </NavSection>
            </>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[var(--border)] p-2">
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
