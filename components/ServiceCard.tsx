import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  demoLink: string;
  status: 'active' | 'beta' | 'coming';
}

export function ServiceCard({
  title,
  description,
  features,
  demoLink,
  status,
}: ServiceCardProps) {
  const cardContent = (
    <>
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

      {/* Action indicator */}
      <div className="flex items-center gap-3">
        {status !== 'coming' ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
            View
            <ArrowRight className="w-3 h-3 text-blue-500" />
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Coming soon</span>
        )}
      </div>
    </>
  );

  const baseClasses = 'block border border-border p-6 transition-colors';

  if (status === 'coming') {
    return (
      <div className={`${baseClasses} opacity-60`}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={demoLink}
      className={`${baseClasses} hover:border-foreground/30 cursor-pointer`}
    >
      {cardContent}
    </Link>
  );
}
