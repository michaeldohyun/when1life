'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-12 bg-background border-b border-border z-30 flex items-center px-4 gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-foreground">Admin</span>
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
        <main className="md:pl-48 pt-12 md:pt-0">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
