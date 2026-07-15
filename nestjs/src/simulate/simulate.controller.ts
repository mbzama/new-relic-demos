import {
  Controller, Get, Query, HttpException, HttpStatus,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const newrelic = require('newrelic') as typeof import('newrelic');

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Controller('simulate')
export class SimulateController {
  /**
   * Simulates a slow transaction — appears in New Relic slow transaction traces.
   * ?ms=2000  (default 2000ms)
   */
  @Get('slow')
  async slowTransaction(@Query('ms') ms = '2000') {
    const duration = Math.min(parseInt(ms, 10), 10000);
    newrelic.addCustomAttribute('simulate.type', 'slow_transaction');
    newrelic.addCustomAttribute('simulate.duration_ms', duration);

    await newrelic.startSegment('simulate:artificial-delay', true, async () => {
      await delay(duration);
    });

    return { message: `Slow transaction completed`, duration_ms: duration };
  }

  /**
   * Triggers a handled error reported to New Relic Error Inbox.
   * ?type=handled|unhandled
   */
  @Get('error')
  async triggerError(@Query('type') type = 'handled') {
    newrelic.addCustomAttribute('simulate.type', 'error');
    newrelic.addCustomAttribute('simulate.error_type', type);

    if (type === 'unhandled') {
      throw new Error('Simulated unhandled error for New Relic demo');
    }

    const err = new Error('Simulated handled error — reported via newrelic.noticeError()');
    newrelic.noticeError(err, {
      'error.context': 'simulate_endpoint',
      'error.severity': 'warning',
    });

    return { message: 'Handled error reported to New Relic', errorMessage: err.message };
  }

  /**
   * Triggers an HTTP 500 — New Relic captures it automatically.
   */
  @Get('crash')
  crash() {
    newrelic.addCustomAttribute('simulate.type', 'crash');
    throw new HttpException(
      { error: 'Simulated 500 crash for New Relic demo' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Records custom metrics visible in New Relic metrics explorer.
   * ?value=42
   */
  @Get('metric')
  recordMetric(@Query('value') value = '1') {
    const numValue = parseFloat(value);
    newrelic.recordMetric('Custom/Simulate/ManualMetric', numValue);
    newrelic.recordCustomEvent('MetricSimulated', {
      metricName: 'Custom/Simulate/ManualMetric',
      value: numValue,
      timestamp: Date.now(),
    });
    return { message: 'Custom metric recorded', metric: 'Custom/Simulate/ManualMetric', value: numValue };
  }

  /**
   * Sends a burst of traffic to generate throughput data in New Relic.
   * ?count=20
   */
  @Get('load')
  async generateLoad(@Query('count') count = '20') {
    const iterations = Math.min(parseInt(count, 10), 100);
    newrelic.addCustomAttribute('simulate.type', 'load');
    newrelic.addCustomAttribute('simulate.iterations', iterations);

    const results: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const latency = Math.random() * 200;
      await delay(latency);
      newrelic.recordMetric('Custom/Simulate/LoadTest', latency);
      results.push(Math.round(latency));
    }

    return {
      message: `Load simulation complete`,
      iterations,
      latencies_ms: results,
      avg_ms: Math.round(results.reduce((a, b) => a + b, 0) / results.length),
    };
  }

  /**
   * Sets a custom transaction name visible in New Relic APM transactions.
   */
  @Get('custom-transaction')
  customTransaction(@Query('name') name = 'DemoTransaction') {
    newrelic.setTransactionName(name);
    newrelic.addCustomAttributes({
      'simulate.type': 'custom_transaction',
      'transaction.custom_name': name,
    });
    return { message: `Transaction named: ${name}` };
  }
}
