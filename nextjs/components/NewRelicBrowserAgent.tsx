'use client';

import { useEffect, useRef } from 'react';
import { BrowserAgent } from '@newrelic/browser-agent/loaders/browser-agent';

// These are inlined at build time by Next.js (NEXT_PUBLIC_ prefix)
const accountID = process.env.NEXT_PUBLIC_NR_ACCOUNT_ID ?? '';
const agentID = process.env.NEXT_PUBLIC_NR_AGENT_ID ?? '';
const applicationID = process.env.NEXT_PUBLIC_NR_APPLICATION_ID ?? '';
const licenseKey = process.env.NEXT_PUBLIC_NR_LICENSE_KEY ?? '';

const NR_OPTIONS = {
  info: {
    applicationID,
    beacon: 'bam.nr-data.net',
    errorBeacon: 'bam.nr-data.net',
    licenseKey,
    sa: 1,
  },
  init: {
    ajax: { deny_list: ['bam.nr-data.net'] },
    browser_consent_mode: { enabled: false },
    distributed_tracing: { enabled: true },
    performance: { capture_detail: false, capture_marks: false, capture_measures: true },
    privacy: { cookies_enabled: true },
  },
  loader_config: {
    accountID,
    agentID,
    applicationID,
    licenseKey,
    trustKey: accountID,
  },
};

// Instantiated once globally — survives React re-renders
let agentInstance: BrowserAgent | null = null;

export default function NewRelicBrowserAgent() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || agentInstance) return;
    initialized.current = true;

    if (!licenseKey || !applicationID) return;

    agentInstance = new BrowserAgent(NR_OPTIONS);
  }, []);

  return null;
}
