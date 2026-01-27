import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  demoLink: string;
  status: 'active' | 'beta' | 'coming';
  telegramLink?: string;
}

export function ServiceCard({
  title,
  description,
  features,
  demoLink,
  status,
  telegramLink,
}: ServiceCardProps) {
  return (
    <div className="border border-border p-6 hover:border-foreground/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-base font-medium text-foreground">{title}</h2>
        {status === 'beta' && (
          <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5">
            Beta
          </span>
        )}
        {status === 'coming' && (
          <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5">
            Coming
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {/* Features */}
      <ul className="space-y-1.5 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {status !== 'coming' ? (
          <Link
            href={demoLink}
            className="inline-flex items-center gap-1.5 text-xs text-foreground hover:text-muted-foreground transition-colors"
          >
            View Demo
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">Coming soon</span>
        )}

        {telegramLink && (
          <>
            <span className="text-muted-foreground">&middot;</span>
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Contact
            </a>
          </>
        )}
      </div>
    </div>
  );
}
