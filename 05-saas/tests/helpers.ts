import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';

// Imported AFTER env-setup.ts sets env vars via jest setupFiles
import { AppDataSource } from '../src/config/database.config';
import { createApp } from '../src/app';

// ── App singleton (lives for the entire Jest worker process) ──────────────────
let _app: Application | null = null;
let _initialized = false;

export async function getApp(): Promise<Application> {
  if (_app) return _app;

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  if (!_initialized) {
    await seedTestRoles();
    _initialized = true;
  }

  _app = createApp();
  return _app;
}

/**
 * Call in afterAll of each test file.
 * Does NOT destroy the DB connection — let it stay alive across test files
 * since Jest maxWorkers=1 runs them all in the same process.
 * The connection is cleaned up by Jest's forceExit.
 */
export async function closeApp(): Promise<void> {
  // Reset admin cache so each test file gets a fresh admin if it re-calls getAdminUser
  _adminUser = null;
  // Keep _app and DB alive for subsequent test files
}

/** Forcefully tears everything down (use only in globalTeardown if needed) */
export async function destroyAll(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  _app = null;
  _initialized = false;
  _adminUser = null;
}

// ── Seed helpers ─────────────────────────────────────────────────────────────
async function seedTestRoles(): Promise<void> {
  const roles = [
    { name: 'super_admin', display_name: 'Super Administrator', is_default: false },
    { name: 'admin', display_name: 'Administrator', is_default: false },
    { name: 'member', display_name: 'Member', is_default: false },
    { name: 'viewer', display_name: 'Viewer', is_default: true },
  ];

  for (const role of roles) {
    await AppDataSource.query(
      `INSERT INTO roles (id, name, display_name, description, is_default, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, '', $3, NOW(), NOW())
       ON CONFLICT (name) DO NOTHING`,
      [role.name, role.display_name, role.is_default],
    );
  }

  const modules = [
    'users', 'roles', 'settings', 'media', 'pages', 'contacts',
    'activity_logs', 'notifications', 'banners',
    'organizations', 'members', 'invitations', 'plans', 'subscriptions',
    'invoices', 'payment_methods', 'usage', 'api_keys', 'features', 'projects',
    'webhooks', 'auth',
  ];
  const actions = ['view', 'create', 'update', 'delete'];

  for (const mod of modules) {
    for (const action of actions) {
      const name = `${mod}.${action}`;
      await AppDataSource.query(
        `INSERT INTO permissions (id, name, display_name, group_name, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         ON CONFLICT (name) DO NOTHING`,
        [name, `${action} ${mod}`, mod],
      );
    }
  }

  // super_admin gets all perms
  await AppDataSource.query(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r, permissions p
    WHERE r.name = 'super_admin'
    ON CONFLICT DO NOTHING
  `);
}

// ── Auth helpers ─────────────────────────────────────────────────────────────
export interface TestUser {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

let _adminUser: TestUser | null = null;

/**
 * Returns a cached super_admin test user.
 * Call resetAdminCache() in afterAll if you need fresh credentials.
 */
export async function getAdminUser(app: Application): Promise<TestUser> {
  if (_adminUser) return _adminUser;

  const email = `admin_${Date.now()}@test.com`;
  const password = 'Admin@123456';

  const reg = await request(app)
    .post('/api/v1/auth/register')
    .send({ email, password, fullName: 'Test Admin' });

  if (reg.status !== 201 && reg.status !== 200) {
    throw new Error(`Register failed (${reg.status}): ${JSON.stringify(reg.body)}`);
  }

  // reg.body.data = { user: { id, email, ... } }
  const registeredUserId = reg.body.data?.user?.id;
  if (!registeredUserId) {
    throw new Error(`Register returned unexpected body: ${JSON.stringify(reg.body)}`);
  }

  // Promote to super_admin
  await AppDataSource.query(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT $1, r.id FROM roles r WHERE r.name = 'super_admin'
     ON CONFLICT DO NOTHING`,
    [registeredUserId],
  );

  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (login.status !== 200) {
    throw new Error(`Login failed (${login.status}): ${JSON.stringify(login.body)}`);
  }

  // login.body.data = { user: {...}, accessToken, refreshToken }
  _adminUser = {
    id: login.body.data.user.id,
    email,
    accessToken: login.body.data.accessToken,
    refreshToken: login.body.data.refreshToken,
  };

  return _adminUser;
}

export async function registerAndLogin(
  app: Application,
  suffix = '',
): Promise<TestUser> {
  const email = `user_${Date.now()}${suffix}@test.com`;
  const password = 'User@123456';

  await request(app)
    .post('/api/v1/auth/register')
    .send({ email, password, fullName: 'Test User' });

  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (login.status !== 200) {
    throw new Error(`registerAndLogin failed (${login.status}): ${JSON.stringify(login.body)}`);
  }

  return {
    id: login.body.data.user.id,
    email,
    accessToken: login.body.data.accessToken,
    refreshToken: login.body.data.refreshToken,
  };
}

// ── Utility helpers ───────────────────────────────────────────────────────────
export async function cleanTable(table: string, where = ''): Promise<void> {
  const sql = where
    ? `DELETE FROM ${table} WHERE ${where}`
    : `DELETE FROM ${table}`;
  await AppDataSource.query(sql);
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

/** Reset the admin user cache (e.g. after token expiry or between test files) */
export function resetAdminCache(): void {
  _adminUser = null;
}
