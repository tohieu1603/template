/**
 * Global Jest setup: creates and seeds the test database.
 * Runs once before all test suites.
 */
import 'reflect-metadata';

// Override DB to use test database BEFORE any app modules load
process.env.NODE_ENV = 'test';
process.env.DB_HOST = '192.168.1.5';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'duc';
process.env.DB_PASSWORD = '080103';
process.env.DB_NAME = 'blogs';
process.env.DB_SSL = 'false';
process.env.DB_SYNC = 'true';
process.env.DB_LOGGING = 'false';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_2026';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_2026';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.RATE_LIMIT_MAX = '10000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.API_PREFIX = '/api/v1';
process.env.SEED_ADMIN_EMAIL = 'admin@test.com';
process.env.SEED_ADMIN_PASSWORD = 'Admin@123';

import { hashPassword } from '../src/common/utils/password.util';

async function seedTestDatabase(): Promise<void> {
  const { AppDataSource } = await import('../src/config/database.config');

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Create roles
    const roles = [
      { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access', is_default: false },
      { name: 'admin', display_name: 'Administrator', description: 'Admin panel access', is_default: false },
      { name: 'editor', display_name: 'Editor', description: 'Can publish and edit all posts', is_default: false },
      { name: 'writer', display_name: 'Writer', description: 'Can create and edit own posts', is_default: false },
      { name: 'viewer', display_name: 'Viewer', description: 'Read-only access', is_default: true },
    ];

    for (const role of roles) {
      await queryRunner.query(
        `INSERT INTO roles (id, name, display_name, description, is_default, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`,
        [role.name, role.display_name, role.description, role.is_default],
      );
    }

    // Create permissions
    const modules = [
      'users', 'roles', 'posts', 'categories', 'tags', 'series',
      'comments', 'authors', 'banners', 'media', 'pages',
      'contacts', 'activity_logs', 'notifications', 'settings',
      'redirects', 'newsletters',
    ];
    const actions = ['view', 'create', 'update', 'delete'];
    const extraPermissions = [
      { name: 'posts.publish', displayName: 'Publish posts', group: 'posts' },
      { name: 'posts.edit_any', displayName: 'Edit any post', group: 'posts' },
      { name: 'comments.approve', displayName: 'Approve comments', group: 'comments' },
    ];

    for (const module of modules) {
      for (const action of actions) {
        const name = `${module}.${action}`;
        const displayName = `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`;
        await queryRunner.query(
          `INSERT INTO permissions (id, name, display_name, group_name, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, NOW())
           ON CONFLICT (name) DO NOTHING`,
          [name, displayName, module],
        );
      }
    }
    for (const perm of extraPermissions) {
      await queryRunner.query(
        `INSERT INTO permissions (id, name, display_name, group_name, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         ON CONFLICT (name) DO NOTHING`,
        [perm.name, perm.displayName, perm.group],
      );
    }

    // Assign all permissions to super_admin
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'super_admin'
      ON CONFLICT DO NOTHING
    `);

    // Admin: non-delete
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'admin' AND p.name NOT LIKE '%.delete'
      ON CONFLICT DO NOTHING
    `);

    // Editor
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'editor' AND (
        p.group_name IN ('posts', 'categories', 'tags', 'series', 'comments', 'media', 'authors', 'banners')
      )
      ON CONFLICT DO NOTHING
    `);

    // Writer
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'writer' AND (
        (p.group_name = 'posts' AND p.name IN ('posts.view', 'posts.create', 'posts.update'))
        OR (p.group_name IN ('categories', 'tags', 'series', 'comments', 'authors') AND p.name LIKE '%.view')
        OR (p.group_name = 'media' AND p.name IN ('media.view', 'media.create'))
        OR (p.name = 'comments.create')
      )
      ON CONFLICT DO NOTHING
    `);

    // Viewer
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'viewer' AND p.name LIKE '%.view'
      AND p.group_name IN ('posts', 'categories', 'tags', 'series', 'authors')
      ON CONFLICT DO NOTHING
    `);

    // Create admin user (update password on conflict for test reliability)
    const adminEmail = 'admin@test.com';
    const adminPasswordHash = await hashPassword('Admin@123');
    const adminResult = await queryRunner.query(
      `INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'Test Admin', true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      [adminEmail, adminPasswordHash],
    );
    const adminId = adminResult[0].id;

    // Assign super_admin role
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'super_admin'
      ON CONFLICT DO NOTHING
    `, [adminId]);

    // Create default author for admin
    await queryRunner.query(`
      INSERT INTO authors (id, user_id, name, slug, email, is_active, is_featured, sort_order, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, 'Test Admin', 'test-admin', $2, true, false, 0, NOW(), NOW())
      ON CONFLICT (slug) DO NOTHING
    `, [adminId, adminEmail]);

    // Seed default categories
    const categories = [
      { name: 'Technology', slug: 'technology', description: 'Tech articles' },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle articles' },
    ];
    for (const cat of categories) {
      await queryRunner.query(
        `INSERT INTO categories (id, name, slug, description, sort_order, is_active, view_count, level, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, 0, true, 0, 0, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description],
      );
    }

    // Seed default tags
    const tags = [
      { name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
      { name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
    ];
    for (const tag of tags) {
      await queryRunner.query(
        `INSERT INTO tags (id, name, slug, color, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [tag.name, tag.slug, tag.color],
      );
    }

    // Seed settings
    const settings = [
      { key: 'site_name', value: 'Test Blog', type: 'string', group: 'general' },
      { key: 'allow_comments', value: 'true', type: 'boolean', group: 'comments' },
      { key: 'moderate_comments', value: 'false', type: 'boolean', group: 'comments' },
    ];
    for (const setting of settings) {
      await queryRunner.query(
        `INSERT INTO settings (id, key, value, type, group_name, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
         ON CONFLICT (key) DO NOTHING`,
        [setting.key, setting.value, setting.type, setting.group],
      );
    }

    await queryRunner.commitTransaction();
    console.log('Test database seeded successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

export default async function globalSetup(): Promise<void> {
  try {
    await seedTestDatabase();
    console.log('Global test setup complete');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  }
}
