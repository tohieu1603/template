import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../../config/database.config';
import { hashPassword } from '../../common/utils/password.util';
import { env } from '../../config/env.config';
import { logger } from '../../common/utils/logger';

/**
 * Database seed script.
 * Creates default roles, permissions, and admin user.
 * Safe to run multiple times (idempotent via ON CONFLICT DO NOTHING).
 */
async function seed(): Promise<void> {
  await AppDataSource.initialize();
  logger.info('Seeding database...');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Create default roles
    const roles = [
      { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access', is_default: false },
      { name: 'admin', display_name: 'Administrator', description: 'Admin panel access', is_default: false },
      { name: 'staff', display_name: 'Staff', description: 'Limited admin access', is_default: false },
      { name: 'customer', display_name: 'Customer', description: 'Regular customer', is_default: true },
    ];

    for (const role of roles) {
      await queryRunner.query(
        `INSERT INTO roles (id, name, display_name, description, is_default, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`,
        [role.name, role.display_name, role.description, role.is_default],
      );
    }
    logger.info('Roles seeded');

    // 2. Create permissions
    const modules = [
      'users', 'roles', 'products', 'categories', 'brands', 'attributes',
      'orders', 'payments', 'coupons', 'reviews', 'banners',
      'shipping_methods', 'settings', 'media', 'pages', 'contacts',
      'activity_logs', 'notifications',
    ];

    const actions = ['view', 'create', 'update', 'delete'];

    for (const module of modules) {
      for (const action of actions) {
        const name = `${module}.${action}`;
        const displayName = `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.replace('_', ' ')}`;
        await queryRunner.query(
          `INSERT INTO permissions (id, name, display_name, group_name, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, NOW())
           ON CONFLICT (name) DO NOTHING`,
          [name, displayName, module],
        );
      }
    }
    logger.info('Permissions seeded');

    // 3. Assign all permissions to super_admin
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'super_admin'
      ON CONFLICT DO NOTHING
    `);

    // 4. Assign non-delete permissions to admin
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'admin' AND p.name NOT LIKE '%.delete'
      ON CONFLICT DO NOTHING
    `);

    // 5. Assign view-only permissions to staff
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'staff' AND p.name LIKE '%.view'
      ON CONFLICT DO NOTHING
    `);

    logger.info('Role permissions assigned');

    // 6. Create admin user
    const adminEmail = env.SEED_ADMIN_EMAIL;
    const adminPasswordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);

    const existingAdmin = await queryRunner.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail],
    );

    let adminId: string;
    if (!existingAdmin.length) {
      const result = await queryRunner.query(
        `INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, 'Super Administrator', true, NOW(), NOW())
         RETURNING id`,
        [adminEmail, adminPasswordHash],
      );
      adminId = result[0].id;
      logger.info(`Admin user created: ${adminEmail}`);
    } else {
      adminId = existingAdmin[0].id;
      logger.info(`Admin user already exists: ${adminEmail}`);
    }

    // Assign super_admin role to admin user
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'super_admin'
      ON CONFLICT DO NOTHING
    `, [adminId]);

    // 7. Seed default settings
    const settings = [
      { key: 'site_name', value: 'E-commerce Store', type: 'string', group: 'general' },
      { key: 'site_description', value: 'Your one-stop shop for everything', type: 'string', group: 'general' },
      { key: 'currency', value: 'USD', type: 'string', group: 'general' },
      { key: 'items_per_page', value: '12', type: 'number', group: 'display' },
      { key: 'max_cart_items', value: '50', type: 'number', group: 'cart' },
      { key: 'tax_rate', value: '0', type: 'number', group: 'pricing' },
      { key: 'free_shipping_threshold', value: '100', type: 'number', group: 'shipping' },
      { key: 'maintenance_mode', value: 'false', type: 'boolean', group: 'general' },
    ];

    for (const setting of settings) {
      await queryRunner.query(
        `INSERT INTO settings (id, key, value, type, group_name, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
         ON CONFLICT (key) DO NOTHING`,
        [setting.key, setting.value, setting.type, setting.group],
      );
    }
    logger.info('Settings seeded');

    // 8. Seed default shipping methods
    await queryRunner.query(`
      INSERT INTO shipping_methods (id, name, code, description, base_fee, free_ship_threshold, estimated_days, is_active, sort_order, created_at, updated_at)
      VALUES
        (gen_random_uuid(), 'Standard Shipping', 'standard', 'Delivery in 5-7 business days', 5.99, 50, '5-7 days', true, 1, NOW(), NOW()),
        (gen_random_uuid(), 'Express Shipping', 'express', 'Delivery in 2-3 business days', 12.99, 100, '2-3 days', true, 2, NOW(), NOW()),
        (gen_random_uuid(), 'Overnight Shipping', 'overnight', 'Next day delivery', 24.99, 200, '1 day', true, 3, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING
    `);
    logger.info('Shipping methods seeded');

    await queryRunner.commitTransaction();
    logger.info('Database seeded successfully!');
    logger.info(`Admin login: ${adminEmail} / ${env.SEED_ADMIN_PASSWORD}`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    logger.error('Seeding failed', { error });
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  logger.error('Seed script failed', { error });
  process.exit(1);
});
