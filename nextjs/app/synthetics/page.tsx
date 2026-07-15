import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Synthetics Guide — NR Demo' };

const monitors = [
  {
    title: 'API — Products Availability',
    type: 'Scripted API',
    desc: 'Pings GET /api/products every 5 min from multiple locations. Alerts if 0 products are returned or if response time exceeds 2s.',
    file: 'products-availability',
    code: `// New Relic Synthetic — Scripted API Monitor
// Runtime: Node 16.10.0 | Location: select 3+ regions

const assert = require('assert');

const BASE_URL = 'https://your-nestjs-api.example.com/api';

$http.get(
  { uri: BASE_URL + '/products', timeout: 10000 },
  function (err, response, body) {
    assert.equal(err, null, 'Request error: ' + err);
    assert.equal(response.statusCode, 200, 'Expected 200 got ' + response.statusCode);

    const products = JSON.parse(body);
    assert.ok(Array.isArray(products), 'Response is not an array');
    assert.ok(products.length > 0, 'No products returned — catalog may be empty');

    // Custom attribute visible in Synthetic results
    $util.insights.set('productCount', products.length);

    console.log('Products available:', products.length);
  }
);`,
  },
  {
    title: 'Scripted Browser — Checkout Flow',
    type: 'Scripted Browser',
    desc: 'Navigates to /products, clicks a product, creates an order, verifies order appears in /orders. Runs every 10 min.',
    file: 'checkout-flow',
    code: `// New Relic Synthetic — Scripted Browser Monitor
// Runtime: Chrome 112 | Location: select 2+ regions

const assert = require('assert');

const BASE_URL = 'https://your-nextjs-app.example.com';

$browser
  .get(BASE_URL)
  .then(() => $browser.getTitle())
  .then((title) => {
    assert.ok(title.includes('New Relic'), 'Unexpected page title: ' + title);
  })
  .then(() => $browser.findElement($driver.By.linkText('Products')).click())
  .then(() => $browser.waitForAndFindElement($driver.By.css('h1'), 5000))
  .then((h1) => h1.getText())
  .then((text) => {
    assert.equal(text, 'Products', 'Expected Products page heading');
  })
  .then(() => $browser.findElement($driver.By.linkText('Orders')).click())
  .then(() => $browser.waitForAndFindElement($driver.By.css('h1'), 5000))
  .then((h1) => h1.getText())
  .then((text) => {
    assert.equal(text, 'Orders', 'Expected Orders page heading');
    console.log('Checkout flow passed');
  });`,
  },
  {
    title: 'API — Simulate Endpoint Health',
    type: 'Scripted API',
    desc: 'Calls /api/simulate/metric to verify the NestJS APM agent is alive and recording metrics. Alerts on 5xx.',
    file: 'simulate-health',
    code: `// New Relic Synthetic — Scripted API Monitor
// Verifies the simulate endpoints respond correctly

const assert = require('assert');

const BASE_URL = 'https://your-nestjs-api.example.com/api';

// Chain: metric → slow (short) → verify both
$http.get(
  { uri: BASE_URL + '/simulate/metric?value=99', timeout: 5000 },
  function (err, res, body) {
    assert.equal(err, null, 'Metric request failed: ' + err);
    assert.equal(res.statusCode, 200, 'Metric returned ' + res.statusCode);

    const data = JSON.parse(body);
    assert.ok(data.metric, 'No metric field in response');
    $util.insights.set('metricValue', data.value);

    $http.get(
      { uri: BASE_URL + '/simulate/slow?ms=500', timeout: 10000 },
      function (err2, res2) {
        assert.equal(err2, null, 'Slow request failed: ' + err2);
        assert.equal(res2.statusCode, 200, 'Slow returned ' + res2.statusCode);
        console.log('Simulate health check passed');
      }
    );
  }
);`,
  },
  {
    title: 'Step Monitor — Homepage Performance',
    type: 'Step Monitor',
    desc: 'Point-and-click monitor using New Relic UI. Checks homepage loads, measures Core Web Vitals, alerts if LCP > 3s.',
    file: null,
    steps: [
      'Navigate to https://your-nextjs-app.example.com',
      'Assert title contains "New Relic"',
      'Assert element h1 is visible',
      'Assert element nav is visible',
      'Click link text "Products"',
      'Assert element h1 contains "Products"',
    ],
  },
];

export default function SyntheticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Synthetics Guide</h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Copy these scripts into{' '}
          <strong className="text-gray-200">New Relic &gt; Synthetic Monitoring &gt; Create Monitor</strong>.
          Replace the <code className="text-[#00AC69]">BASE_URL</code> constants with your deployed
          app URLs. Each monitor runs from multiple global locations on a schedule.
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 mb-6 text-sm">
        <h2 className="font-semibold mb-2 text-[#00AC69]">Setup Steps</h2>
        <ol className="list-decimal list-inside text-gray-400 space-y-1">
          <li>
            In New Relic: <strong className="text-gray-200">Synthetic Monitoring → Create monitor</strong>
          </li>
          <li>Choose monitor type (Scripted API, Scripted Browser, or Step Monitor)</li>
          <li>Set runtime to <code>Node.js 16.10.0</code> (API) or <code>Chrome 112</code> (Browser)</li>
          <li>Paste the script, update the <code>BASE_URL</code> to your deployed endpoint</li>
          <li>Select 3+ locations for global availability coverage</li>
          <li>Set period (5–15 min) and attach an alert policy</li>
        </ol>
      </div>

      <div className="space-y-6">
        {monitors.map((m) => (
          <div key={m.title} className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <h2 className="font-semibold">{m.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#00AC69]/10 text-[#00AC69] border border-[#00AC69]/20 shrink-0 ml-4">
                {m.type}
              </span>
            </div>
            {m.code ? (
              <pre className="p-4 text-xs text-gray-300 overflow-auto bg-gray-950 leading-relaxed">
                <code>{m.code}</code>
              </pre>
            ) : (
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-3">
                  Create this in the New Relic UI using the visual step editor. No scripting required.
                </p>
                <ol className="space-y-1.5">
                  {m.steps?.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-[#00AC69] font-mono text-xs mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm">
        <h2 className="font-semibold mb-2">Alerting Recommendations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400">
          <div>
            <p className="font-medium text-gray-200 mb-1">Alert Conditions to Create</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Monitor failure from any location</li>
              <li>Monitor failure from all locations</li>
              <li>Response time &gt; 3 s (p95)</li>
              <li>Custom attribute threshold (e.g. productCount = 0)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-200 mb-1">Notification Channels</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Slack (via webhook workflow)</li>
              <li>PagerDuty / OpsGenie</li>
              <li>Email</li>
              <li>New Relic mobile app push</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
