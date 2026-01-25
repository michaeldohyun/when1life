'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Menu, X, Home, Lightbulb, BookOpen, Quote, Settings, Search } from 'lucide-react';
import { ThemeToggleIcon } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '홈', href: '/', icon: Home },
  { name: '아이디어', href: '/?category=idea', icon: Lightbulb, category: 'idea' },
  { name: '읽을거리', href: '/?category=article', icon: BookOpen, category: 'article' },
  { name: '명언', href: '/?category=quote', icon: Quote, category: 'quote' },
];

function HeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useAuth();

  const isActive = (item: typeof navigation[0]) => {
    if (item.href === '/') {
      return pathname === '/' && !currentCategory;
    }
    return item.category === currentCategory;
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <nav className="mx-auto max-w-5xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground hover:text-muted-foreground transition-colors"
          >
            When1.Life
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1.5",
                  isActive(item)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1.5",
                  pathname.startsWith('/admin')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Settings className="w-4 h-4" />
                관리자
              </Link>
            )}
            <ThemeToggleIcon />
          </div>

          {/* Mobile: Theme, Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggleIcon />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="메뉴 열기"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                    isActive(item)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                    pathname.startsWith('/admin')
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Settings className="w-4 h-4" />
                  관리자
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderContent />
    </Suspense>
  );
}
