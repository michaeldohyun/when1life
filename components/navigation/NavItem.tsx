'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { Suspense } from 'react';

interface NavItemProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  isActive?: boolean;
}

function NavItemInner({ href, label, icon: Icon, count, isActive: isActiveProp }: NavItemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { close } = useSidebar();

  const categoryParam = searchParams.get('category');
  const hrefUrl = new URL(href, 'http://localhost');
  const hrefCategory = hrefUrl.searchParams.get('category');

  const isActive = isActiveProp !== undefined
    ? isActiveProp
    : href === '/'
      ? pathname === '/' && !categoryParam
      : categoryParam === hrefCategory;

  const handleClick = () => {
    close();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`
        relative flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all duration-150
        ${isActive
          ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-4 before:bg-[var(--accent)] before:rounded-full'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
        }
      `}
    >
      {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent)]' : ''}`} />}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className={`text-xs tabular-nums ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}>
          {count}
        </span>
      )}
    </Link>
  );
}

export function NavItem(props: NavItemProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm text-[var(--text-secondary)]">
        {props.icon && <props.icon className="w-4 h-4 shrink-0" />}
        <span className="flex-1 truncate">{props.label}</span>
      </div>
    }>
      <NavItemInner {...props} />
    </Suspense>
  );
}
