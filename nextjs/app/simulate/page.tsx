'use client';

import { useState } from 'react';
import { simulateApi } from '@/lib/api';
import { addPageAction, noticeError } from '@/lib/newrelic-browser';

type Scenario =
  | 'slow'
  | 'error-handled'
  | 'error-unhandled'
  | 'crash'
  | 'metric'
  | 'load'
  | 'custom-transaction'
  | 'js-error';

interface Result {
  scenario: Scenario;
  status: 'ok' | 'error';
  data: unknown;
  durationMs: number;
}

const scenarios: {
  key: Scenario;
  label: string;
  desc: string;
  nrFeature: string;
  color: string;
}[] = [
  {
    key: 'slow',
    label: 'Slow Transaction',
    desc: 'Delays 2s server-side. Shows in APM → Transaction Traces as a slow trace.',
    nrFeature: 'APM Slow Traces',
    color: 'yellow',
  },
  {
    key: 'error-handled',
    label: 'Handled Error',
    desc: 'Server calls newrelic.noticeError() — appears in Error Inbox without an HTTP 500.',
    nrFeature: 'Error Inbox',
    color: 'orange',
  },
  {
    key: 'error-unhandled',
    label: 'Unhandled Error',
    desc: 'Throws an uncaught exception. NestJS catches it as a 500; APM records the stack.',
    nrFeature: 'APM Errors',
    color: 'red',
  },
  {
    key: 'crash',
    label: 'HTTP 500 Crash',
    desc: 'Returns HTTP 500. Captured by NR APM and visible in Browser AJAX errors.',
    nrFeature: 'APM + Browser AJAX',
    color: 'red',
  },
  {
    key: 'metric',
    label: 'Custom Metric',
    desc: 'Records Custom/Simulate/ManualMetric and a MetricSimulated custom event.',
    nrFeature: 'Custom Metrics',
    color: 'blue',
  },
  {
    key: 'load',
    label: 'Load Burst',
    desc: 'Runs 20 iterations on the server, each recording a latency metric.',
    nrFeature: 'Throughput',
    color: 'purple',
  },
  {
    key: 'custom-transaction',
    label: 'Custom Transaction Name',
    desc: 'Calls newrelic.setTransactionName() — visible in APM Transaction view.',
    nrFeature: 'APM Transactions',
    color: 'teal',
  },
  {
    key: 'js-error',
    label: 'Browser JS Error',
    desc: 'Throws a JS error in the browser, captured by window.newrelic.noticeError().',
    nrFeature: 'Browser JS Errors',
    color: 'pink',
  },
];

const COLOR_MAP: Record<string, string> = {
  yellow: 'border-yellow-700 hover:border-yellow-500',
  orange: 'border-orange-700 hover:border-orange-500',
  red: 'border-red-700 hover:border-red-500',
  blue: 'border-blue-700 hover:border-blue-500',
  purple: 'border-purple-700 hover:border-purple-500',
  teal: 'border-teal-700 hover:border-teal-500',
  pink: 'border-pink-700 hover:border-pink-500',
};

const BADGE_MAP: Record<string, string> = {
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  red: 'text-red-400 bg-red-400/10 border-red-400/30',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  purple: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  teal: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
  pink: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
};

export default function SimulatePage() {
  const [running, setRunning] = useState<Scenario | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  const run = async (key: Scenario) => {
    setRunning(key);
    const start = Date.now();
    try {
      let data: unknown;

      if (key === 'js-error') {
        // Fires entirely in the browser — no API call
        const err = new Error('Simulated browser JS error for New Relic demo');
        noticeError(err, { scenario: 'js-error', page: 'simulate' });
        data = { message: 'JS error sent to New Relic Browser via window.newrelic.noticeError()' };
      } else if (key === 'slow') {
        data = await simulateApi.slow(2000);
      } else if (key === 'error-handled') {
        data = await simulateApi.error('handled');
      } else if (key === 'error-unhandled') {
        data = await simulateApi.error('unhandled').catch((e: Error) => ({
          message: `Expected server error: ${e.message}`,
        }));
      } else if (key === 'crash') {
        data = await simulateApi.crash().catch((e: Error) => ({
          message: `Expected 500: ${e.message}`,
        }));
      } else if (key === 'metric') {
        data = await simulateApi.metric(Math.round(Math.random() * 100));
      } else if (key === 'load') {
        data = await simulateApi.load(20);
      } else if (key === 'custom-transaction') {
        data = await simulateApi.customTransaction('NRDemoTransaction');
      }

      const durationMs = Date.now() - start;
      addPageAction(`simulate:${key}`, { status: 'ok', durationMs });
      setResults((r) => [{ scenario: key, status: 'ok' as const, data, durationMs }, ...r].slice(0, 20));
    } catch (err) {
      const durationMs = Date.now() - start;
      noticeError(err instanceof Error ? err : new Error(String(err)), { scenario: key });
      addPageAction(`simulate:${key}`, { status: 'error', durationMs });
      setResults((r) =>
        [
          {
            scenario: key,
            status: 'error' as const,
            data: { error: err instanceof Error ? err.message : String(err) },
            durationMs,
          },
          ...r,
        ].slice(0, 20),
      );
    } finally {
      setRunning(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Simulate New Relic Scenarios</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Each button triggers a scenario in the NestJS APM agent or the browser agent. Open New
          Relic to observe the results in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {scenarios.map((s) => (
          <button
            key={s.key}
            onClick={() => run(s.key)}
            disabled={running !== null}
            className={`text-left rounded-xl border bg-gray-900 p-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${COLOR_MAP[s.color]}`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-medium text-sm">
                {running === s.key ? (
                  <span className="animate-pulse">Running…</span>
                ) : (
                  s.label
                )}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full border ${BADGE_MAP[s.color]}`}
              >
                {s.nrFeature}
              </span>
            </div>
            <p className="text-xs text-gray-400">{s.desc}</p>
          </button>
        ))}
      </div>

      {results.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Results</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 text-sm ${
                  r.status === 'ok'
                    ? 'border-gray-700 bg-gray-900'
                    : 'border-red-800 bg-red-900/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`font-mono text-xs ${r.status === 'ok' ? 'text-[#00AC69]' : 'text-red-400'}`}
                  >
                    {r.status === 'ok' ? '✓' : '✗'} {r.scenario}
                  </span>
                  <span className="text-gray-500 text-xs">{r.durationMs}ms</span>
                </div>
                <pre className="text-xs text-gray-400 overflow-auto max-h-24">
                  {JSON.stringify(r.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
