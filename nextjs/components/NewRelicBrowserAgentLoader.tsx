'use client';

import dynamic from 'next/dynamic';

// @newrelic/browser-agent touches window.NREUM at module load time.
// ssr: false prevents it from being evaluated during SSR / static prerendering.
// This wrapper must itself be a Client Component so ssr: false is valid.
const NewRelicBrowserAgent = dynamic(
  () => import('./NewRelicBrowserAgent'),
  { ssr: false },
);

export default function NewRelicBrowserAgentLoader() {
  return <NewRelicBrowserAgent />;
}
