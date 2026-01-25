'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-primary)] border-b border-[var(--border)] z-30 flex items-center px-4 gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-[var(--text-primary)]">관리자</h1>
        </header>

        {/* Mobile Sidebar */}
        <AdminSidebar
          isMobile
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Desktop Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="md:pl-64 pt-14 md:pt-0">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
