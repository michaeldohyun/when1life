import { ServiceCard } from '@/components/ServiceCard';

const services = [
  {
    title: 'Clipper',
    description: 'AI-powered content curation from Telegram',
    features: [
      'Save text, links, and images via Telegram',
      'AI auto-categorization and tagging',
      'Daily digest notifications',
    ],
    demoLink: '/clips',
    status: 'active' as const,
  },
  {
    title: 'Running Coach',
    description: '80/20 running methodology with smart training',
    features: [
      'Intervals.icu integration',
      'Personalized training plans',
      'Performance analytics',
    ],
    demoLink: '/running',
    status: 'beta' as const,
  },
  {
    title: 'Fasting Coach',
    description: 'Intermittent fasting tracker with body composition',
    features: [
      'Multiple fasting protocols (16:8, 18:6, etc.)',
      'Body composition tracking',
      'Progress insights',
    ],
    demoLink: '/fasting',
    status: 'beta' as const,
  },
];

export default function WorkflowsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-xl font-medium text-foreground mb-2">
          AI-Powered Personal Workflows
        </h1>
        <p className="text-sm text-muted-foreground">
          Experimental automation tools built with Telegram, n8n, and Supabase
        </p>
      </div>

      {/* Services */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs text-muted-foreground text-center">
        Built by{' '}
        <a
          href="https://t.me/when1log"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          @when1log
        </a>
      </p>
    </div>
  );
}
