// This runs in each test worker BEFORE any test modules are loaded.
// Sets env vars so that config/env.config.ts picks up test database settings.

process.env.NODE_ENV = 'test';
process.env.DB_HOST = '192.168.1.5';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'saas';
process.env.DB_USER = 'duc';
process.env.DB_PASSWORD = '080103';
process.env.DB_SSL = 'false';
process.env.DB_SYNC = 'true';
process.env.DB_LOGGING = 'false';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.RATE_LIMIT_MAX = '10000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.CORS_ORIGIN = 'http://localhost:3002';
process.env.UPLOAD_DIR = 'uploads';
process.env.API_PREFIX = '/api/v1';
