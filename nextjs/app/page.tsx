import Link from 'next/link';

const cards = [
  {
    href: '/products',
    title: 'Products',
    desc: 'CRUD operations against the NestJS API. Generates page actions, interaction traces, and API call spans in New Relic Browser.',
    icon: '📦',
    badge: 'Browser Agent',
  },
  {
    href: '/orders',
    title: 'Orders',
    desc: 'Create and update orders. Each action is recorded as a named interaction, letting you track user journeys in NR Browser.',
    icon: '🛒',
    badge: 'Interaction Tracing',
  },
  {
    href: '/simulate',
    title: 'Simulate NR Scenarios',
    desc: 'Trigger slow transactions, handled/unhandled errors, custom metrics, load bursts, and named transactions in the NestJS APM agent.',
    icon: '⚡',
    badge: 'APM + Browser',
  },
  {
    href: '/synthetics',
    title: 'Synthetics Guide',
    desc: 'Scripted browser and API monitor examples you can paste into New Relic Synthetic Monitoring to test this app continuously.',
    icon: '🤖',
    badge: 'Synthetic Monitoring',
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">New Relic Browser &amp; Synthetic Demo</h1>
        <p className="text-gray-400 max-w-2xl">
          A Next.js frontend that demonstrates{' '}
          <span className="text-[#00AC69]">New Relic Browser Monitoring</span> and{' '}
          <span className="text-[#00AC69]">Synthetic Monitoring</span>. All API calls go to the
          NestJS backend which is instrumented with New Relic APM — giving you end-to-end distributed
          traces from browser click to server response.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group block rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-[#00AC69]/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{c.icon}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#00AC69]/10 text-[#00AC69] border border-[#00AC69]/20">
                {c.badge}
              </span>
            </div>
            <h2 className="text-lg font-semibold mb-1 group-hover:text-[#00AC69] transition-colors">
              {c.title}
            </h2>
            <p className="text-sm text-gray-400">{c.desc}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="font-semibold mb-3 text-[#00AC69]">What gets captured in New Relic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">Browser Agent</h3>
            <ul className="text-gray-400 space-y-0.5 list-disc list-inside">
              <li>Page load timing (LCP, FID, CLS)</li>
              <li>AJAX call duration &amp; errors</li>
              <li>JavaScript errors</li>
              <li>Custom page actions</li>
              <li>Named interactions</li>
              <li>Custom attributes</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">APM (NestJS)</h3>
            <ul className="text-gray-400 space-y-0.5 list-disc list-inside">
              <li>Transaction throughput &amp; errors</li>
              <li>Slow transaction traces</li>
              <li>Custom segments &amp; spans</li>
              <li>Custom metrics &amp; events</li>
              <li>Error inbox notices</li>
              <li>Distributed traces</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">Synthetic Monitors</h3>
            <ul className="text-gray-400 space-y-0.5 list-disc list-inside">
              <li>Scripted Browser monitors</li>
              <li>API step monitors</li>
              <li>Availability alerting</li>
              <li>Multi-step user flows</li>
              <li>SLA reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
