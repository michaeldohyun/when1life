'use client';

import { ReactNode } from 'react';

interface NavSectionProps {
  title?: string;
  children: ReactNode;
}

export function NavSection({ title, children }: NavSectionProps) {
  return (
    <div className="py-2">
      {title && (
        <h3 className="px-3 mb-2 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="space-y-0.5">
        {children}
      </nav>
    </div>
  );
}
