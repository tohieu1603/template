import 'reflect-metadata';

/**
 * Global setup: configure environment variables for test DB before any module loads.
 * Runs once before all test suites in a separate Node.js process.
 */
export default async function globalSetup() {
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = '192.168.1.5';
  process.env.DB_PORT = '5432';
  process.env.DB_NAME = 'booking';
  process.env.DB_USER = 'duc';
  process.env.DB_PASSWORD = '080103';
  process.env.DB_SYNC = 'true';
  process.env.DB_LOGGING = 'false';
  process.env.DB_SSL = 'false';
  process.env.JWT_ACCESS_SECRET = 'test_access_secret';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.RATE_LIMIT_MAX = '10000';
  process.env.RATE_LIMIT_WINDOW_MS = '900000';
  process.env.SEED_ADMIN_EMAIL = 'admin@test.com';
  process.env.SEED_ADMIN_PASSWORD = 'Admin@123';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  process.env.API_PREFIX = '/api/v1';
  process.env.UPLOAD_DIR = 'uploads';
}
