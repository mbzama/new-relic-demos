// Injects the New Relic Browser agent snippet server-side.
// @newrelic/next auto-injects when NEW_RELIC_LICENSE_KEY is set.
// This component provides a manual fallback using the JS snippet approach
// if you configure the browser agent via copy-paste snippet from NR UI.
//
// To use the copy-paste snippet approach:
//   1. In New Relic UI: Browser > Add data > Copy/paste JavaScript
//   2. Set NEXT_PUBLIC_NR_SNIPPET to the full script tag content
//   3. Or configure via env vars below for the loader approach.

export default function NewRelicBrowserSnippet() {
  const accountId = process.env.NEXT_PUBLIC_NR_ACCOUNT_ID;
  const agentId = process.env.NEXT_PUBLIC_NR_AGENT_ID;
  const licenseKey = process.env.NEXT_PUBLIC_NR_LICENSE_KEY;
  const applicationId = process.env.NEXT_PUBLIC_NR_APPLICATION_ID;

  // Only render when all four values are configured
  if (!accountId || !agentId || !licenseKey || !applicationId) {
    return null;
  }

  // Browser agent loader config — matches the snippet NR generates in the UI
  const config = {
    accountID: accountId,
    agentID: agentId,
    licenseKey,
    applicationID: applicationId,
    trustKey: accountId,
  };

  const initConfig = {
    distributed_tracing: { enabled: true },
    privacy: { cookies_enabled: true },
    ajax: { deny_list: ['bam.nr-data.net'] },
  };

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
window.NREUM||(NREUM={});
NREUM.init=${JSON.stringify(initConfig)};
NREUM.loader_config=${JSON.stringify(config)};
NREUM.info=${JSON.stringify({ beacon: 'bam.nr-data.net', errorBeacon: 'bam.nr-data.net', licenseKey, applicationID: applicationId, sa: 1 })};
`,
      }}
    />
  );
}
