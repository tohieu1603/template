// globalSetup: runs once before all test suites in a fresh Node.js context
export default async function globalSetup(): Promise<void> {
  // Set env vars first — before any module imports that read them
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

  // Dynamically import DataSource AFTER env vars are set
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('reflect-metadata');

  const { DataSource } = require('typeorm');
  const path = require('path');

  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!, 10),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
    synchronize: true,
    logging: false,
    entities: [
      path.join(__dirname, '../src/modules/**/entities/*.entity{.ts,.js}'),
      path.join(__dirname, '../src/common/entities/*.entity{.ts,.js}'),
    ],
  });

  try {
    await ds.initialize();
    console.log('[globalSetup] Test DB (saas) connected and synced');
    await ds.destroy();
  } catch (err: any) {
    console.error('[globalSetup] DB connection failed:', err.message);
    throw err;
  }
}
