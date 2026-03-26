import 'reflect-metadata';
import { Application } from 'express';
import supertest from 'supertest';

// Set env BEFORE any config module loads
process.env.NODE_ENV = 'test';
process.env.DB_HOST = '192.168.1.5';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'ecommerce';
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

import { createApp } from '../src/app';
import { AppDataSource } from '../src/config/database.config';
import { hashPassword } from '../src/common/utils/password.util';

let _app: Application | null = null;

export function getApp(): Application {
  if (!_app) {
    _app = createApp();
  }
  return _app;
}

export function request() {
  return supertest(getApp());
}

/**
 * Initialize and seed the test database.
 * Run in beforeAll of each test file.
 */
export async function initTestDb(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await seedTestDatabase();
}

/**
 * Destroy the DB connection.
 * Run in afterAll of each test file.
 */
export async function destroyTestDb(): Promise<void> {
  // Don't destroy — shared across test suites in --runInBand mode.
  // Jest will exit process after all suites anyway.
}

/**
 * Seed roles, permissions, admin user, customer user, staff user, and default settings.
 * Idempotent — safe to call multiple times.
 */
export async function seedTestDatabase(): Promise<void> {
  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    // Roles
    const roles = [
      { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access', is_default: false },
      { name: 'admin', display_name: 'Administrator', description: 'Admin panel access', is_default: false },
      { name: 'staff', display_name: 'Staff', description: 'Limited admin access', is_default: false },
      { name: 'customer', display_name: 'Customer', description: 'Regular customer', is_default: true },
    ];
    for (const role of roles) {
      await qr.query(
        `INSERT INTO roles (id, name, display_name, description, is_default, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`,
        [role.name, role.display_name, role.description, role.is_default],
      );
    }

    // Permissions
    const modules = [
      'users', 'roles', 'products', 'categories', 'brands', 'attributes',
      'orders', 'payments', 'coupons', 'reviews', 'banners',
      'shipping_methods', 'settings', 'media', 'pages', 'contacts',
      'activity_logs', 'notifications',
    ];
    const actions = ['view', 'create', 'update', 'delete'];
    for (const mod of modules) {
      for (const action of actions) {
        const name = `${mod}.${action}`;
        const displayName = `${action.charAt(0).toUpperCase() + action.slice(1)} ${mod.replace('_', ' ')}`;
        await qr.query(
          `INSERT INTO permissions (id, name, display_name, group_name, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, NOW())
           ON CONFLICT (name) DO NOTHING`,
          [name, displayName, mod],
        );
      }
    }

    // super_admin gets all permissions
    await qr.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'super_admin'
      ON CONFLICT DO NOTHING
    `);

    // admin gets non-delete
    await qr.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'admin' AND p.name NOT LIKE '%.delete'
      ON CONFLICT DO NOTHING
    `);

    // staff gets view-only
    await qr.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'staff' AND p.name LIKE '%.view'
      ON CONFLICT DO NOTHING
    `);

    // Admin user
    const adminEmail = 'admin@test.com';
    const adminHash = await hashPassword('Admin@123');
    const adminRes = await qr.query(
      `INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'Test Admin', true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      [adminEmail, adminHash],
    );
    const adminId = adminRes[0].id;
    await qr.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'super_admin'
      ON CONFLICT DO NOTHING
    `, [adminId]);

    // Staff user
    const staffEmail = 'staff@test.com';
    const staffHash = await hashPassword('Staff@123');
    const staffRes = await qr.query(
      `INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'Test Staff', true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      [staffEmail, staffHash],
    );
    const staffId = staffRes[0].id;
    await qr.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'staff'
      ON CONFLICT DO NOTHING
    `, [staffId]);

    // Customer user
    const customerEmail = 'customer@test.com';
    const customerHash = await hashPassword('Customer@123');
    const custRes = await qr.query(
      `INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'Test Customer', true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      [customerEmail, customerHash],
    );
    const customerId = custRes[0].id;
    await qr.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'customer'
      ON CONFLICT DO NOTHING
    `, [customerId]);

    // Customer2 user (isolated cart tests)
    const customer2Email = 'customer2@test.com';
    const customer2Hash = await hashPassword('Customer@123');
    const res2 = await qr.query(
      `INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'Test Customer 2', true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      [customer2Email, customer2Hash],
    );
    const customerId2 = res2[0].id;
    await qr.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'customer'
      ON CONFLICT DO NOTHING
    `, [customerId2]);

    // Default settings
    const settings = [
      { key: 'site_name', value: 'E-commerce Store', type: 'string', group: 'general' },
      { key: 'currency', value: 'USD', type: 'string', group: 'general' },
      { key: 'items_per_page', value: '12', type: 'number', group: 'display' },
      { key: 'tax_rate', value: '0', type: 'number', group: 'pricing' },
      { key: 'free_shipping_threshold', value: '100', type: 'number', group: 'shipping' },
    ];
    for (const s of settings) {
      await qr.query(
        `INSERT INTO settings (id, key, value, type, group_name, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
         ON CONFLICT (key) DO NOTHING`,
        [s.key, s.value, s.type, s.group],
      );
    }

    // Shipping methods
    await qr.query(`
      INSERT INTO shipping_methods (id, name, code, description, base_fee, free_ship_threshold, estimated_days, is_active, sort_order, created_at, updated_at)
      VALUES
        (gen_random_uuid(), 'Standard Shipping', 'standard', 'Delivery in 5-7 business days', 5.99, 50, '5-7 days', true, 1, NOW(), NOW()),
        (gen_random_uuid(), 'Express Shipping', 'express', 'Delivery in 2-3 business days', 12.99, 100, '2-3 days', true, 2, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING
    `);

    await qr.commitTransaction();
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
