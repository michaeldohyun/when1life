'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  // Admin 페이지에서는 Sidebar 없이 전체 폭 사용
  if (isAdminPage) {
    return <>{children}</>;
  }

  // 일반 페이지에서는 Sidebar와 함께 표시
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
