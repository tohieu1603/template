/**
 * Global Jest setup: initialize DB connection for test suite.
 * Uses TEST_DB_NAME env override (portfolio).
 */
import 'reflect-metadata';

export default async function globalSetup(): Promise<void> {
  // Set test env variables before any module loads
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = '192.168.1.5';
  process.env.DB_PORT = '5432';
  process.env.DB_NAME = 'portfolio';
  process.env.DB_USER = 'duc';
  process.env.DB_PASSWORD = '080103';
  process.env.DB_SSL = 'false';
  process.env.DB_SYNC = 'true';
  process.env.DB_LOGGING = 'false';
  process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_2026';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_2026';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.API_PREFIX = '/api/v1';
  process.env.RATE_LIMIT_MAX = '10000';
  process.env.RATE_LIMIT_WINDOW_MS = '900000';
  process.env.CORS_ORIGIN = 'http://localhost:3001';
  process.env.UPLOAD_DIR = 'uploads';
  process.env.MAX_FILE_SIZE = '5242880';
  process.env.LOG_LEVEL = 'error';
  process.env.LOG_DIR = 'logs';
  process.env.SEED_ADMIN_EMAIL = 'admin@example.com';
  process.env.SEED_ADMIN_PASSWORD = 'Admin@123';
}
