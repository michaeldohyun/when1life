import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-8">
          Welcome to when1log
        </p>
        <nav className="flex items-center justify-center gap-4 text-xs">
          <Link
            href="/workflows"
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Workflows
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            About
          </Link>
        </nav>
      </div>
    </div>
  );
}
