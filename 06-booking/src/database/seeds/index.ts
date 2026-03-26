import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../../config/database.config';
import { hashPassword } from '../../common/utils/password.util';
import { env } from '../../config/env.config';
import { logger } from '../../common/utils/logger';

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
      { name: 'provider', display_name: 'Service Provider', description: 'Staff/provider access', is_default: false },
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

    // 2. Create permissions (20 modules × 4 actions)
    const modules = [
      'users', 'roles', 'settings', 'media', 'pages', 'contacts',
      'activity_logs', 'notifications', 'banners',
      'service_categories', 'services', 'providers', 'bookings',
      'availability', 'customer_profiles', 'payments', 'reviews', 'holidays',
      'provider_services',
    ];

    const actions = ['view', 'create', 'update', 'delete'];

    for (const module of modules) {
      for (const action of actions) {
        const name = `${module}.${action}`;
        const displayName = `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.replace(/_/g, ' ')}`;
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

    // 5. Assign view-only to provider
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'provider' AND p.name LIKE '%.view'
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
      { key: 'business_name', value: 'Booking Service', type: 'string', group: 'general' },
      { key: 'timezone', value: 'Asia/Saigon', type: 'string', group: 'general' },
      { key: 'booking_advance_days', value: '30', type: 'number', group: 'booking' },
      { key: 'cancellation_policy_hours', value: '24', type: 'number', group: 'booking' },
      { key: 'currency', value: 'VND', type: 'string', group: 'general' },
      { key: 'slot_interval_minutes', value: '15', type: 'number', group: 'booking' },
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

    // 8. Seed service categories
    const categories = [
      { name: 'Hair', slug: 'hair', description: 'Hair care services', sort_order: 1 },
      { name: 'Nails', slug: 'nails', description: 'Nail care services', sort_order: 2 },
      { name: 'Spa & Massage', slug: 'spa-massage', description: 'Relaxation and wellness', sort_order: 3 },
      { name: 'Dental', slug: 'dental', description: 'Dental care services', sort_order: 4 },
      { name: 'Medical Checkup', slug: 'medical-checkup', description: 'Health screening services', sort_order: 5 },
    ];

    for (const cat of categories) {
      await queryRunner.query(
        `INSERT INTO service_categories (id, name, slug, description, sort_order, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description, cat.sort_order],
      );
    }
    logger.info('Service categories seeded');

    // 9. Seed sample services
    const hairCatResult = await queryRunner.query(
      `SELECT id FROM service_categories WHERE slug = 'hair'`,
    );
    const nailCatResult = await queryRunner.query(
      `SELECT id FROM service_categories WHERE slug = 'nails'`,
    );

    if (hairCatResult.length > 0) {
      const hairCatId = hairCatResult[0].id;
      const services = [
        {
          name: 'Haircut', slug: 'haircut', category_id: hairCatId,
          duration_minutes: 30, price: 50000, description: 'Professional haircut service',
        },
        {
          name: 'Hair Color', slug: 'hair-color', category_id: hairCatId,
          duration_minutes: 120, price: 300000, description: 'Full hair coloring service',
        },
      ];

      for (const svc of services) {
        await queryRunner.query(
          `INSERT INTO services (id, category_id, name, slug, description, duration_minutes, buffer_minutes, price, currency, max_capacity, is_active, sort_order, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 10, $6, 'VND', 1, true, 1, NOW(), NOW())
           ON CONFLICT (slug) DO NOTHING`,
          [svc.category_id, svc.name, svc.slug, svc.description, svc.duration_minutes, svc.price],
        );
      }
    }

    if (nailCatResult.length > 0) {
      const nailCatId = nailCatResult[0].id;
      await queryRunner.query(
        `INSERT INTO services (id, category_id, name, slug, description, duration_minutes, buffer_minutes, price, currency, max_capacity, is_active, sort_order, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, 'Manicure', 'manicure', 'Professional manicure service', 45, 10, 100000, 'VND', 1, true, 1, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [nailCatId],
      );
    }

    logger.info('Sample services seeded');

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
