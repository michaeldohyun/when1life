'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Lightbulb, BookOpen, Quote, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  tags?: string[];
}

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: Home },
];

const CATEGORY_ITEMS = [
  { href: '/?category=idea', label: '아이디어', icon: Lightbulb, category: 'idea' },
  { href: '/?category=article', label: '읽을거리', icon: BookOpen, category: 'article' },
  { href: '/?category=quote', label: '명언', icon: Quote, category: 'quote' },
];

function AppSidebarContent({ tags = [] }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const currentTag = searchParams.get('tag');
  const { isAdmin } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' && !currentCategory && !currentTag;
    }
    const url = new URL(href, 'http://localhost');
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');

    if (category) return currentCategory === category;
    if (tag) return currentTag === tag;
    return false;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <span className="text-base font-semibold text-sidebar-foreground">
            When1.Life
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>카테고리</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CATEGORY_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {tags.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>태그</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tags.slice(0, 10).map((tag) => (
                    <SidebarMenuItem key={tag}>
                      <SidebarMenuButton asChild isActive={isActive(`/?tag=${tag}`)}>
                        <Link href={`/?tag=${tag}`}>
                          <span>#{tag}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {isAdmin && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin">
                  <Settings className="w-4 h-4" />
                  <span>관리자</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebar({ tags = [] }: AppSidebarProps) {
  return (
    <Suspense fallback={null}>
      <AppSidebarContent tags={tags} />
    </Suspense>
  );
}
