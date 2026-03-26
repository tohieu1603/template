import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../../config/database.config';
import { hashPassword } from '../../common/utils/password.util';
import { env } from '../../config/env.config';
import { logger } from '../../common/utils/logger';

/**
 * Database seed script for Blog.
 * Creates default roles, permissions, admin user, default author, and settings.
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
    logger.info('Roles seeded');

    // 2. Create permissions
    const modules = [
      'users', 'roles', 'posts', 'categories', 'tags', 'series',
      'comments', 'authors', 'banners', 'media', 'pages',
      'contacts', 'activity_logs', 'notifications', 'settings',
      'redirects', 'newsletters',
    ];

    const actions = ['view', 'create', 'update', 'delete'];

    // Blog-specific permissions
    const extraPermissions = [
      { name: 'posts.publish', displayName: 'Publish posts', group: 'posts' },
      { name: 'posts.edit_any', displayName: 'Edit any post', group: 'posts' },
      { name: 'comments.approve', displayName: 'Approve comments', group: 'comments' },
    ];

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

    for (const perm of extraPermissions) {
      await queryRunner.query(
        `INSERT INTO permissions (id, name, display_name, group_name, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         ON CONFLICT (name) DO NOTHING`,
        [perm.name, perm.displayName, perm.group],
      );
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

    // 5. Editor: posts/categories/tags/comments/media/authors permissions
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'editor' AND (
        p.group_name IN ('posts', 'categories', 'tags', 'series', 'comments', 'media', 'authors', 'banners')
      )
      ON CONFLICT DO NOTHING
    `);

    // 6. Writer: own post CRUD + view categories/tags/comments + media upload
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

    // 7. Viewer: view-only for public content
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'viewer' AND p.name LIKE '%.view'
      AND p.group_name IN ('posts', 'categories', 'tags', 'series', 'authors')
      ON CONFLICT DO NOTHING
    `);

    logger.info('Role permissions assigned');

    // 8. Create admin user
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

    // Assign super_admin role
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'super_admin'
      ON CONFLICT DO NOTHING
    `, [adminId]);

    // 9. Create default author for admin
    await queryRunner.query(`
      INSERT INTO authors (id, user_id, name, slug, email, is_active, is_featured, sort_order, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, 'Admin', 'admin', $2, true, false, 0, NOW(), NOW())
      ON CONFLICT (slug) DO NOTHING
    `, [adminId, adminEmail]);
    logger.info('Default author created');

    // 10. Seed default settings
    const settings = [
      { key: 'site_name', value: 'Blog', type: 'string', group: 'general' },
      { key: 'site_description', value: 'A modern blog platform', type: 'string', group: 'general' },
      { key: 'site_url', value: 'http://localhost:3001', type: 'string', group: 'general' },
      { key: 'posts_per_page', value: '12', type: 'number', group: 'display' },
      { key: 'allow_comments', value: 'true', type: 'boolean', group: 'comments' },
      { key: 'moderate_comments', value: 'false', type: 'boolean', group: 'comments' },
      { key: 'seo_title', value: 'Blog - Latest Articles', type: 'string', group: 'seo' },
      { key: 'seo_description', value: 'Read the latest articles on our blog', type: 'string', group: 'seo' },
      { key: 'maintenance_mode', value: 'false', type: 'boolean', group: 'general' },
      { key: 'analytics_id', value: '', type: 'string', group: 'analytics' },
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

    // 11. Seed default categories
    const categories = [
      { name: 'Technology', slug: 'technology', description: 'Tech news and tutorials' },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle articles and tips' },
      { name: 'Business', slug: 'business', description: 'Business insights and analysis' },
    ];

    for (const cat of categories) {
      await queryRunner.query(
        `INSERT INTO categories (id, name, slug, description, sort_order, is_active, view_count, level, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, 0, true, 0, 0, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description],
      );
    }
    logger.info('Categories seeded');

    // 12. Seed default tags
    const tags = [
      { name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
      { name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
      { name: 'Node.js', slug: 'nodejs', color: '#339933' },
      { name: 'React', slug: 'react', color: '#61dafb' },
      { name: 'Tutorial', slug: 'tutorial', color: '#e91e63' },
    ];

    for (const tag of tags) {
      await queryRunner.query(
        `INSERT INTO tags (id, name, slug, color, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [tag.name, tag.slug, tag.color],
      );
    }
    logger.info('Tags seeded');

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
