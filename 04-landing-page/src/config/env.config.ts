import 'dotenv/config';

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? '';
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3005', 10),
  API_PREFIX: process.env.API_PREFIX ?? '/api/v1',

  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT ?? '5432', 10),
  DB_NAME: process.env.DB_NAME ?? 'landing_page',
  DB_USER: process.env.DB_USER ?? 'duc',
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_SSL: process.env.DB_SSL === 'true',
  DB_SYNC: process.env.DB_SYNC === 'true',
  DB_LOGGING: process.env.DB_LOGGING === 'true',

  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET', 'dev_access_secret_change_in_prod'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_prod'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',

  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? 'http://localhost:3005').split(','),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),

  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE ?? '5242880', 10),

  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  LOG_DIR: process.env.LOG_DIR ?? 'logs',

  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123',

  get isProduction() { return this.NODE_ENV === 'production'; },
  get isDevelopment() { return this.NODE_ENV === 'development'; },
};
