import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource, initializeDatabase } from '../../config/database.config';
import { hashPassword } from '../../common/utils/password.util';
import { env } from '../../config/env.config';
import { logger } from '../../common/utils/logger';

async function seed(): Promise<void> {
  await initializeDatabase();
  logger.info('Seeding database...');

  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    // 1. Roles
    const roles = [
      { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access', is_default: false },
      { name: 'admin', display_name: 'Administrator', description: 'Admin panel access', is_default: false },
      { name: 'kitchen_staff', display_name: 'Kitchen Staff', description: 'Kitchen operations access', is_default: false },
      { name: 'waiter', display_name: 'Waiter', description: 'Waiter operations access', is_default: false },
      { name: 'customer', display_name: 'Customer', description: 'Regular customer', is_default: true },
    ];
    for (const role of roles) {
      await qr.query(
        `INSERT INTO roles (id, name, display_name, description, is_default, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (name) DO NOTHING`,
        [role.name, role.display_name, role.description, role.is_default],
      );
    }
    logger.info('Roles seeded');

    // 2. Permissions
    const modules = [
      'users', 'roles', 'settings', 'media', 'pages', 'contacts', 'activity_logs', 'notifications', 'banners',
      'menu_categories', 'menu_items', 'tables', 'reservations', 'orders', 'order_items', 'coupons',
      'payments', 'reviews', 'kitchen_queue', 'operating_hours', 'dashboard',
    ];
    const actions = ['view', 'create', 'update', 'delete'];
    for (const module of modules) {
      for (const action of actions) {
        const name = `${module}.${action}`;
        const displayName = `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.replace(/_/g, ' ')}`;
        await qr.query(
          `INSERT INTO permissions (id, name, display_name, group_name, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, NOW()) ON CONFLICT (name) DO NOTHING`,
          [name, displayName, module],
        );
      }
    }
    logger.info('Permissions seeded');

    // 3. Assign permissions to super_admin
    await qr.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin'
      ON CONFLICT DO NOTHING
    `);

    // 4. Assign non-delete permissions to admin
    await qr.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'admin' AND p.name NOT LIKE '%.delete'
      ON CONFLICT DO NOTHING
    `);

    // 5. Assign kitchen permissions to kitchen_staff
    await qr.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'kitchen_staff' AND (p.name LIKE 'kitchen_queue.%' OR p.name LIKE 'orders.view' OR p.name LIKE 'order_items.%')
      ON CONFLICT DO NOTHING
    `);

    // 6. Assign waiter permissions
    await qr.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'waiter' AND (p.name LIKE 'orders.%' OR p.name LIKE 'tables.%' OR p.name LIKE 'reservations.%' OR p.name LIKE 'menu_items.view' OR p.name LIKE 'menu_categories.view')
      ON CONFLICT DO NOTHING
    `);

    logger.info('Role permissions assigned');

    // 7. Admin user
    const adminEmail = env.SEED_ADMIN_EMAIL;
    const adminPasswordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);
    const existingAdmin = await qr.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    let adminId: string;
    if (!existingAdmin.length) {
      const result = await qr.query(
        `INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, 'Super Administrator', true, NOW(), NOW()) RETURNING id`,
        [adminEmail, adminPasswordHash],
      );
      adminId = result[0].id;
      logger.info(`Admin user created: ${adminEmail}`);
    } else {
      adminId = existingAdmin[0].id;
      logger.info(`Admin user already exists: ${adminEmail}`);
    }
    await qr.query(`INSERT INTO user_roles (user_id, role_id) SELECT $1, r.id FROM roles r WHERE r.name = 'super_admin' ON CONFLICT DO NOTHING`, [adminId]);

    // 8. Settings
    const settings = [
      { key: 'restaurant_name', value: 'Seafood House', type: 'string', group: 'general' },
      { key: 'address', value: '123 Main Street, District 1, Ho Chi Minh City', type: 'string', group: 'general' },
      { key: 'phone', value: '+84 28 1234 5678', type: 'string', group: 'general' },
      { key: 'email', value: 'info@restaurant.vn', type: 'string', group: 'general' },
      { key: 'tax_rate', value: '10', type: 'number', group: 'pricing' },
      { key: 'currency', value: 'VND', type: 'string', group: 'general' },
      { key: 'timezone', value: 'Asia/Saigon', type: 'string', group: 'general' },
      { key: 'delivery_radius_km', value: '10', type: 'number', group: 'delivery' },
      { key: 'min_order_delivery', value: '100000', type: 'number', group: 'delivery' },
      { key: 'delivery_fee', value: '25000', type: 'number', group: 'delivery' },
    ];
    for (const s of settings) {
      await qr.query(
        `INSERT INTO settings (id, key, value, type, group_name, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW()) ON CONFLICT (key) DO NOTHING`,
        [s.key, s.value, s.type, s.group],
      );
    }
    logger.info('Settings seeded');

    // 9. Menu categories
    const categories = [
      { name: 'Appetizers', slug: 'appetizers', description: 'Start your meal with our delicious appetizers', sort_order: 1 },
      { name: 'Main Course', slug: 'main-course', description: 'Our signature main dishes', sort_order: 2 },
      { name: 'Seafood', slug: 'seafood', description: 'Fresh seafood from the ocean', sort_order: 3 },
      { name: 'Drinks', slug: 'drinks', description: 'Refreshing beverages', sort_order: 4 },
      { name: 'Desserts', slug: 'desserts', description: 'Sweet endings to your meal', sort_order: 5 },
    ];
    for (const cat of categories) {
      await qr.query(
        `INSERT INTO menu_categories (id, name, slug, description, sort_order, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW()) ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description, cat.sort_order],
      );
    }
    logger.info('Menu categories seeded');

    // 10. Menu items
    const menuItems = [
      { name: 'Spring Rolls', slug: 'spring-rolls', category_slug: 'appetizers', price: 50000, prep_time: 15, description: 'Crispy Vietnamese spring rolls with dipping sauce' },
      { name: 'Grilled Salmon', slug: 'grilled-salmon', category_slug: 'seafood', price: 250000, prep_time: 25, description: 'Fresh Atlantic salmon grilled to perfection' },
      { name: 'Pad Thai', slug: 'pad-thai', category_slug: 'main-course', price: 120000, prep_time: 20, description: 'Classic Thai stir-fried noodles with prawns' },
      { name: 'Mango Smoothie', slug: 'mango-smoothie', category_slug: 'drinks', price: 45000, prep_time: 5, description: 'Fresh mango blended with yogurt and honey' },
    ];
    for (const item of menuItems) {
      await qr.query(`
        INSERT INTO menu_items (id, category_id, name, slug, description, price, currency, is_available, is_featured, is_vegetarian, is_spicy, sort_order, prep_time_minutes, created_at, updated_at)
        SELECT gen_random_uuid(), mc.id, $1, $2, $3, $4, 'VND', true, false, false, false, 0, $5, NOW(), NOW()
        FROM menu_categories mc WHERE mc.slug = $6
        ON CONFLICT (slug) DO NOTHING
      `, [item.name, item.slug, item.description, item.price, item.prep_time, item.category_slug]);
    }
    logger.info('Menu items seeded');

    // 11. Tables (T1-T10)
    const tables = [
      { number: 'T1', capacity: 2, zone: 'indoor', sort_order: 1 },
      { number: 'T2', capacity: 2, zone: 'indoor', sort_order: 2 },
      { number: 'T3', capacity: 4, zone: 'indoor', sort_order: 3 },
      { number: 'T4', capacity: 4, zone: 'indoor', sort_order: 4 },
      { number: 'T5', capacity: 6, zone: 'indoor', sort_order: 5 },
      { number: 'T6', capacity: 4, zone: 'outdoor', sort_order: 6 },
      { number: 'T7', capacity: 4, zone: 'outdoor', sort_order: 7 },
      { number: 'T8', capacity: 6, zone: 'outdoor', sort_order: 8 },
      { number: 'T9', capacity: 8, zone: 'vip', sort_order: 9 },
      { number: 'T10', capacity: 8, zone: 'vip', sort_order: 10 },
    ];
    for (const t of tables) {
      await qr.query(
        `INSERT INTO tables (id, table_number, zone, capacity, status, sort_order, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, 'available', $4, true, NOW(), NOW()) ON CONFLICT (table_number) DO NOTHING`,
        [t.number, t.zone, t.capacity, t.sort_order],
      );
    }
    logger.info('Tables seeded');

    // 12. Operating hours (Mon-Sun 10:00-22:00)
    const days = [0, 1, 2, 3, 4, 5, 6]; // 0=Sunday
    for (const day of days) {
      await qr.query(
        `INSERT INTO operating_hours (id, day_of_week, open_time, close_time, is_closed, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, '10:00', '22:00', false, NOW(), NOW())
         ON CONFLICT (day_of_week) DO NOTHING`,
        [day],
      );
    }
    logger.info('Operating hours seeded');

    await qr.commitTransaction();
    logger.info('Database seeded successfully!');
    logger.info(`Admin login: ${adminEmail} / ${env.SEED_ADMIN_PASSWORD}`);
  } catch (error) {
    await qr.rollbackTransaction();
    logger.error('Seeding failed', { error });
    throw error;
  } finally {
    await qr.release();
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  logger.error('Seed script failed', { error });
  process.exit(1);
});
