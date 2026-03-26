/**
 * Shared test helpers: DB bootstrap, token generation, factory functions.
 */
import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { DataSource } from 'typeorm';

// ────────────────────────────────────────────────────────────
// DB bootstrap
// ────────────────────────────────────────────────────────────

let _ds: DataSource | null = null;

export async function getTestDataSource(): Promise<DataSource> {
  if (_ds && _ds.isInitialized) return _ds;

  // Import AFTER env is set
  const { AppDataSource } = await import('../src/config/database.config');
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  _ds = AppDataSource;

  // Ensure base seed data exists
  await seedBaseData(_ds);
  return _ds;
}

export async function closeTestDataSource(): Promise<void> {
  if (_ds && _ds.isInitialized) {
    await _ds.destroy();
    _ds = null;
  }
}

// ────────────────────────────────────────────────────────────
// App factory
// ────────────────────────────────────────────────────────────

export async function buildTestApp(): Promise<Application> {
  await getTestDataSource();
  const { createApp } = await import('../src/app');
  return createApp();
}

// ────────────────────────────────────────────────────────────
// Seed helpers
// ────────────────────────────────────────────────────────────

async function seedBaseData(ds: DataSource): Promise<void> {
  // Roles
  const roles = [
    { name: 'super_admin', display_name: 'Super Administrator', description: 'Full access', is_default: false },
    { name: 'admin', display_name: 'Administrator', description: 'Admin access', is_default: false },
    { name: 'editor', display_name: 'Editor', description: 'Content management', is_default: false },
    { name: 'viewer', display_name: 'Viewer', description: 'Read-only', is_default: true },
  ];
  for (const r of roles) {
    await ds.query(
      `INSERT INTO roles (id, name, display_name, description, is_default, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (name) DO NOTHING`,
      [r.name, r.display_name, r.description, r.is_default],
    );
  }

  // Permissions
  const modules = [
    'users', 'roles', 'settings', 'media', 'pages', 'contacts',
    'activity_logs', 'notifications', 'banners',
    'profiles', 'experiences', 'skills', 'certifications',
    'project_categories', 'technologies', 'projects', 'services', 'testimonials',
    'blog',
  ];
  for (const mod of modules) {
    for (const action of ['view', 'create', 'update', 'delete']) {
      const name = `${mod}.${action}`;
      const displayName = `${action.charAt(0).toUpperCase() + action.slice(1)} ${mod.replace(/_/g, ' ')}`;
      await ds.query(
        `INSERT INTO permissions (id, name, display_name, group_name, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         ON CONFLICT (name) DO NOTHING`,
        [name, displayName, mod],
      );
    }
  }

  // super_admin gets all permissions
  await ds.query(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r, permissions p
    WHERE r.name = 'super_admin'
    ON CONFLICT DO NOTHING
  `);

  // admin gets all non-delete
  await ds.query(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r, permissions p
    WHERE r.name = 'admin' AND p.name NOT LIKE '%.delete'
    ON CONFLICT DO NOTHING
  `);

  // viewer gets view-only
  await ds.query(`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r, permissions p
    WHERE r.name = 'viewer' AND p.name LIKE '%.view'
    ON CONFLICT DO NOTHING
  `);
}

// ────────────────────────────────────────────────────────────
// Auth helpers
// ────────────────────────────────────────────────────────────

export interface TestUser {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

const _userCache: Map<string, TestUser> = new Map();

export async function createAndLoginUser(
  app: Application,
  suffix: string,
  role: 'super_admin' | 'admin' | 'editor' | 'viewer' = 'super_admin',
): Promise<TestUser> {
  const cacheKey = `${suffix}:${role}`;
  if (_userCache.has(cacheKey)) return _userCache.get(cacheKey)!;

  const ds = await getTestDataSource();
  const email = `test_${suffix}_${Date.now()}@test.com`;
  const password = 'Test@12345';

  // Register
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ email, password, fullName: `Test ${suffix}` });

  if (regRes.status !== 201) {
    throw new Error(`Register failed for ${email}: ${JSON.stringify(regRes.body)}`);
  }

  const userId: string = regRes.body.data?.user?.id;
  if (!userId) throw new Error('No user id from register');

  // Assign role
  await ds.query(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT $1, r.id FROM roles r WHERE r.name = $2
     ON CONFLICT DO NOTHING`,
    [userId, role],
  );

  // Remove default viewer role if different role assigned
  if (role !== 'viewer') {
    await ds.query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id IN (
        SELECT id FROM roles WHERE name = 'viewer'
      )`,
      [userId],
    );
  }

  // Login
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(loginRes.body)}`);
  }

  const user: TestUser = {
    id: userId,
    email,
    accessToken: loginRes.body.data?.accessToken,
    refreshToken: loginRes.body.data?.refreshToken,
  };
  _userCache.set(cacheKey, user);
  return user;
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export function clearUserCache(): void {
  _userCache.clear();
}

// ────────────────────────────────────────────────────────────
// Cleanup helpers
// ────────────────────────────────────────────────────────────

export async function cleanTable(ds: DataSource, table: string): Promise<void> {
  await ds.query(`DELETE FROM ${table} WHERE true`);
}

// ────────────────────────────────────────────────────────────
// Unique slug/name generators
// ────────────────────────────────────────────────────────────

export function uniqueSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}@test.com`;
}
