'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  // Admin 페이지에서는 Sidebar 없이 전체 폭 사용
  if (isAdminPage) {
    return <>{children}</>;
  }

  // 일반 페이지에서는 Sidebar와 함께 표시
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 lg:ml-60">{children}</div>
    </div>
  );
}
