'use strict';

const env = process.env.NODE_ENV || 'development';

const envConfig = {
  development: {
    transaction_threshold: 200,
    record_sql: 'obfuscated',
    log_level: 'info',
    ignore_status_codes: [404],
    sample_rate: 1.0,
  },
  qa: {
    transaction_threshold: 500,
    record_sql: 'obfuscated',
    log_level: 'info',
    ignore_status_codes: [404],
    sample_rate: 1.0,
  },
  uat: {
    transaction_threshold: 500,
    record_sql: 'obfuscated',
    log_level: 'warn',
    ignore_status_codes: [404],
    sample_rate: 0.5,
  },
  production: {
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
    log_level: 'warn',
    ignore_status_codes: [404],
    sample_rate: 0.1,
  },
};

const cfg = envConfig[env] || envConfig.development;

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || `NestJS-Demo-${env}`],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || cfg.log_level,
    filepath: 'stdout',
  },

  allow_all_headers: true,

  application_logging: {
    enabled: true,
    forwarding: { enabled: true },
    local_decorating: { enabled: false },
    metrics: { enabled: true },
  },

  distributed_tracing: {
    enabled: true,
  },

  transaction_tracer: {
    enabled: true,
    transaction_threshold: cfg.transaction_threshold,
    record_sql: cfg.record_sql,
    explain_threshold: 500,
  },

  slow_sql: {
    enabled: true,
  },

  error_collector: {
    enabled: true,
    ignore_status_codes: cfg.ignore_status_codes,
  },

  custom_insights_events: {
    enabled: true,
    max_samples_stored: 10000,
  },

  attributes: {
    enabled: true,
  },

  // Lower sample rate in uat/prod to reduce noise
  transaction_events: {
    enabled: true,
    max_samples_stored: env === 'production' ? 2000 : 10000,
  },
};
