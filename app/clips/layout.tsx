import { AdminGuard } from '@/components/admin/AdminGuard';
import type { Metadata } from 'next';

// 개인 대시보드 — 관리자 전용 (검색 제외)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
