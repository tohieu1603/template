import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../../config/database.config';
import { hashPassword } from '../../common/utils/password.util';
import { env } from '../../config/env.config';
import { logger } from '../../common/utils/logger';

/**
 * Database seed script.
 * Creates default roles, permissions, admin user, and portfolio seed data.
 * Safe to run multiple times (idempotent).
 */
async function seed(): Promise<void> {
  await AppDataSource.initialize();
  logger.info('Seeding database...');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Seed roles
    const roles = [
      { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access', is_default: false },
      { name: 'admin', display_name: 'Administrator', description: 'Admin panel access', is_default: false },
      { name: 'editor', display_name: 'Editor', description: 'Content management', is_default: false },
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

    // 2. Seed permissions (20 modules x 4 actions)
    const modules = [
      'users', 'roles', 'settings', 'media', 'pages', 'contacts',
      'activity_logs', 'notifications', 'banners',
      'profiles', 'experiences', 'skills', 'certifications',
      'project_categories', 'technologies', 'projects', 'services', 'testimonials',
      'blog',
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

    // 5. Assign view permissions to editor for content modules
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'editor' AND (p.name LIKE '%.view' OR p.name LIKE '%.create' OR p.name LIKE '%.update')
      AND p.group_name IN ('profiles', 'experiences', 'skills', 'certifications', 'project_categories', 'technologies', 'projects', 'services', 'testimonials', 'blog')
      ON CONFLICT DO NOTHING
    `);

    // 6. Assign view-only to viewer
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'viewer' AND p.name LIKE '%.view'
      ON CONFLICT DO NOTHING
    `);

    logger.info('Role permissions assigned');

    // 7. Create admin user
    const adminEmail = env.SEED_ADMIN_EMAIL;
    const adminPasswordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);

    const existingAdmin = await queryRunner.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
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

    await queryRunner.query(
      `INSERT INTO user_roles (user_id, role_id) SELECT $1, r.id FROM roles r WHERE r.name = 'super_admin' ON CONFLICT DO NOTHING`,
      [adminId],
    );

    // 8. Seed default settings
    const settings = [
      { key: 'site_name', value: 'My Portfolio', type: 'string', group: 'general' },
      { key: 'theme', value: 'light', type: 'string', group: 'display' },
      { key: 'analytics_id', value: '', type: 'string', group: 'analytics' },
      { key: 'contact_email', value: adminEmail, type: 'string', group: 'contact' },
      { key: 'items_per_page', value: '10', type: 'number', group: 'display' },
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

    // 9. Seed project categories
    const categories = [
      { name: 'Web App', slug: 'web-app', description: 'Web application development' },
      { name: 'Mobile App', slug: 'mobile-app', description: 'Mobile application development' },
      { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interface and experience design' },
      { name: 'Branding', slug: 'branding', description: 'Brand identity and design' },
      { name: 'API Development', slug: 'api-development', description: 'Backend API development' },
    ];

    for (const cat of categories) {
      await queryRunner.query(
        `INSERT INTO project_categories (id, name, slug, description, is_active, sort_order, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, true, 0, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description],
      );
    }
    logger.info('Project categories seeded');

    // 10. Seed technologies
    const technologies = [
      { name: 'React', slug: 'react', color: '#61DAFB' },
      { name: 'Vue', slug: 'vue', color: '#4FC08D' },
      { name: 'Angular', slug: 'angular', color: '#DD0031' },
      { name: 'Node.js', slug: 'nodejs', color: '#339933' },
      { name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
      { name: 'Python', slug: 'python', color: '#3776AB' },
      { name: 'PostgreSQL', slug: 'postgresql', color: '#4169E1' },
      { name: 'MongoDB', slug: 'mongodb', color: '#47A248' },
      { name: 'Figma', slug: 'figma', color: '#F24E1E' },
      { name: 'Docker', slug: 'docker', color: '#2496ED' },
      { name: 'AWS', slug: 'aws', color: '#FF9900' },
      { name: 'Tailwind CSS', slug: 'tailwind-css', color: '#06B6D4' },
    ];

    for (const tech of technologies) {
      await queryRunner.query(
        `INSERT INTO technologies (id, name, slug, color, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`,
        [tech.name, tech.slug, tech.color],
      );
    }
    logger.info('Technologies seeded');

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
