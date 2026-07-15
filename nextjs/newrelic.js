'use strict';

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'NextJS-NewRelic-Demo'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || 'your-license-key-here',
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
    filepath: 'stdout',
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },
  browser_monitoring: {
    enable: process.env.NEW_RELIC_BROWSER_MONITORING_ENABLE !== 'false',
    auto_instrument: true,
  },
  distributed_tracing: {
    enabled: true,
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
  },
  transaction_events: {
    attributes: {
      enabled: true,
    },
  },
};
