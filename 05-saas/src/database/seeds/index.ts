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
      { name: 'member', display_name: 'Member', description: 'Standard member access', is_default: false },
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
    logger.info('Roles seeded');

    // 2. Create permissions (22 modules x 4 actions)
    const modules = [
      'users', 'roles', 'settings', 'media', 'pages', 'contacts',
      'activity_logs', 'notifications', 'banners',
      'organizations', 'members', 'invitations', 'plans', 'subscriptions',
      'invoices', 'payment_methods', 'usage', 'api_keys', 'features', 'projects',
      'webhooks', 'auth',
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

    // 5. Assign view-only permissions to member
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'member' AND p.name LIKE '%.view'
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
      { key: 'site_name', value: 'SaaS Platform', type: 'string', group: 'general' },
      { key: 'support_email', value: 'support@example.com', type: 'string', group: 'general' },
      { key: 'maintenance_mode', value: 'false', type: 'boolean', group: 'general' },
      { key: 'max_orgs_per_user', value: '5', type: 'number', group: 'limits' },
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

    // 8. Seed subscription plans
    const plans = [
      {
        name: 'Free',
        slug: 'free',
        description: 'Perfect for getting started',
        price_monthly: 0,
        price_yearly: 0,
        trial_days: 14,
        is_popular: false,
        sort_order: 1,
        features: [
          { key: 'max_projects', name: 'Max Projects', value: '3', type: 'number' },
          { key: 'max_members', name: 'Max Members', value: '2', type: 'number' },
          { key: 'storage_gb', name: 'Storage (GB)', value: '1', type: 'number' },
          { key: 'api_calls', name: 'API Calls/month', value: '1000', type: 'number' },
        ],
      },
      {
        name: 'Starter',
        slug: 'starter',
        description: 'For small teams',
        price_monthly: 29,
        price_yearly: 290,
        trial_days: 0,
        is_popular: false,
        sort_order: 2,
        features: [
          { key: 'max_projects', name: 'Max Projects', value: '10', type: 'number' },
          { key: 'max_members', name: 'Max Members', value: '5', type: 'number' },
          { key: 'storage_gb', name: 'Storage (GB)', value: '10', type: 'number' },
          { key: 'api_calls', name: 'API Calls/month', value: '10000', type: 'number' },
        ],
      },
      {
        name: 'Pro',
        slug: 'pro',
        description: 'For growing teams',
        price_monthly: 99,
        price_yearly: 990,
        trial_days: 0,
        is_popular: true,
        sort_order: 3,
        features: [
          { key: 'max_projects', name: 'Max Projects', value: '50', type: 'number' },
          { key: 'max_members', name: 'Max Members', value: '20', type: 'number' },
          { key: 'storage_gb', name: 'Storage (GB)', value: '100', type: 'number' },
          { key: 'api_calls', name: 'API Calls/month', value: '100000', type: 'number' },
        ],
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'For large organizations',
        price_monthly: 299,
        price_yearly: 2990,
        trial_days: 0,
        is_popular: false,
        sort_order: 4,
        features: [
          { key: 'max_projects', name: 'Max Projects', value: 'unlimited', type: 'unlimited' },
          { key: 'max_members', name: 'Max Members', value: 'unlimited', type: 'unlimited' },
          { key: 'storage_gb', name: 'Storage (GB)', value: 'unlimited', type: 'unlimited' },
          { key: 'api_calls', name: 'API Calls/month', value: 'unlimited', type: 'unlimited' },
        ],
      },
    ];

    for (const plan of plans) {
      const existing = await queryRunner.query(`SELECT id FROM plans WHERE slug = $1`, [plan.slug]);

      let planId: string;
      if (!existing.length) {
        const result = await queryRunner.query(
          `INSERT INTO plans (id, name, slug, description, price_monthly, price_yearly, currency, trial_days, is_popular, is_active, sort_order, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'USD', $6, $7, true, $8, NOW(), NOW())
           RETURNING id`,
          [plan.name, plan.slug, plan.description, plan.price_monthly, plan.price_yearly, plan.trial_days, plan.is_popular, plan.sort_order],
        );
        planId = result[0].id;
        logger.info(`Plan created: ${plan.name}`);
      } else {
        planId = existing[0].id;
      }

      // Seed plan features
      for (let i = 0; i < plan.features.length; i++) {
        const f = plan.features[i];
        await queryRunner.query(
          `INSERT INTO plan_features (id, plan_id, feature_key, feature_name, value, value_type, sort_order, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT DO NOTHING`,
          [planId, f.key, f.name, f.value, f.type, i],
        );
      }
    }
    logger.info('Plans seeded');

    // 9. Seed feature flags
    const features = [
      { key: 'dark_mode', name: 'Dark Mode', description: 'Enable dark mode UI', is_enabled: true },
      { key: 'export_csv', name: 'Export CSV', description: 'Allow CSV data export', is_enabled: true },
      { key: 'advanced_analytics', name: 'Advanced Analytics', description: 'Advanced analytics dashboard', is_enabled: false },
      { key: 'custom_domain', name: 'Custom Domain', description: 'Use custom domain name', is_enabled: false },
      { key: 'api_access', name: 'API Access', description: 'Enable REST API access', is_enabled: true },
      { key: 'white_label', name: 'White Label', description: 'White label branding', is_enabled: false },
    ];

    for (const feature of features) {
      await queryRunner.query(
        `INSERT INTO features (id, key, name, description, is_enabled, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (key) DO NOTHING`,
        [feature.key, feature.name, feature.description, feature.is_enabled],
      );
    }
    logger.info('Features seeded');

    await queryRunner.commitTransaction();
    logger.info('Database seeded successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    logger.error('Seed failed', { error });
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  logger.error('Seed script error', { error });
  process.exit(1);
});
