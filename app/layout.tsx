import type { Metadata } from "next";
import { Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://when1.life'),
  title: {
    default: 'Michael Kim (김도현) — Operations & AX',
    template: '%s | Michael Kim',
  },
  description:
    '운영을 시스템으로 바꾸는 Operations & AX 빌더. 검증된 숫자와 프로젝트로 보여드립니다.',
  openGraph: {
    title: 'Michael Kim (김도현) — Operations & AX',
    description: '운영을 시스템으로 바꾸는 Operations & AX 빌더',
    url: 'https://when1.life',
    siteName: 'Michael Kim',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Michael Kim (김도현) — Operations & AX',
    description: '운영을 시스템으로 바꾸는 Operations & AX 빌더',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (theme === 'system' || !theme) && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistMono.variable} ${jetbrainsMono.variable} antialiased bg-background`}
      >
        <AuthProvider>
          <ThemeProvider>
            <MainLayout>{children}</MainLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
