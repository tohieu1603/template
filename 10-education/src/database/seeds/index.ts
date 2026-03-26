import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../../config/database.config';
import { hashPassword } from '../../common/utils/password.util';
import { env } from '../../config/env.config';
import { logger } from '../../common/utils/logger';

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  logger.info('Seeding Education LMS database...');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Roles
    const roles = [
      { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access', is_default: false },
      { name: 'admin', display_name: 'Administrator', description: 'Admin panel access', is_default: false },
      { name: 'instructor', display_name: 'Instructor', description: 'Course instructor', is_default: false },
      { name: 'student', display_name: 'Student', description: 'Regular student', is_default: true },
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

    // 2. Permissions (22 modules x 4 actions)
    const modules = [
      'users', 'roles', 'settings', 'media', 'pages', 'contacts',
      'activity_logs', 'notifications', 'banners', 'instructors',
      'course_categories', 'courses', 'course_sections', 'lessons',
      'quizzes', 'enrollments', 'lesson_progress', 'certificates',
      'payments', 'coupons', 'reviews',
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

    // 5. Assign view permissions to instructor
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'instructor' AND p.name IN (
        'courses.view', 'courses.create', 'courses.update',
        'course_sections.view', 'course_sections.create', 'course_sections.update', 'course_sections.delete',
        'lessons.view', 'lessons.create', 'lessons.update', 'lessons.delete',
        'quizzes.view', 'quizzes.create', 'quizzes.update', 'quizzes.delete',
        'enrollments.view', 'reviews.view'
      )
      ON CONFLICT DO NOTHING
    `);

    logger.info('Role permissions assigned');

    // 6. Create admin user
    const adminEmail = env.SEED_ADMIN_EMAIL;
    const adminPasswordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);

    const existingAdmin = await queryRunner.query(`SELECT id FROM users WHERE email = $1`, [adminEmail]);

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

    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'super_admin'
      ON CONFLICT DO NOTHING
    `, [adminId]);

    // 7. Default settings
    const settings = [
      { key: 'platform_name', value: 'EduPlatform', type: 'string', group: 'general' },
      { key: 'platform_description', value: 'Online Learning Platform', type: 'string', group: 'general' },
      { key: 'currency', value: 'VND', type: 'string', group: 'general' },
      { key: 'certificate_enabled', value: 'true', type: 'boolean', group: 'features' },
      { key: 'max_quiz_attempts', value: '3', type: 'number', group: 'quiz' },
      { key: 'passing_score', value: '70', type: 'number', group: 'quiz' },
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

    // 8. Course categories
    const categories = [
      { name: 'Programming', slug: 'programming', description: 'Software development and programming', sort_order: 1 },
      { name: 'Design', slug: 'design', description: 'UI/UX and graphic design', sort_order: 2 },
      { name: 'Business', slug: 'business', description: 'Business and entrepreneurship', sort_order: 3 },
      { name: 'Marketing', slug: 'marketing', description: 'Digital marketing and SEO', sort_order: 4 },
      { name: 'Data Science', slug: 'data-science', description: 'Data science and machine learning', sort_order: 5 },
    ];

    for (const cat of categories) {
      await queryRunner.query(
        `INSERT INTO course_categories (id, name, slug, description, sort_order, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description, cat.sort_order],
      );
    }
    logger.info('Course categories seeded');

    // 9. Create instructor user for sample courses
    const instructorEmail = 'instructor@example.com';
    const instructorPasswordHash = await hashPassword('Instructor@123');

    const existingInstructor = await queryRunner.query(`SELECT id FROM users WHERE email = $1`, [instructorEmail]);
    let instructorUserId: string;

    if (!existingInstructor.length) {
      const result = await queryRunner.query(
        `INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, 'John Instructor', true, NOW(), NOW())
         RETURNING id`,
        [instructorEmail, instructorPasswordHash],
      );
      instructorUserId = result[0].id;
    } else {
      instructorUserId = existingInstructor[0].id;
    }

    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'instructor'
      ON CONFLICT DO NOTHING
    `, [instructorUserId]);

    // Create instructor profile
    const existingProfile = await queryRunner.query(`SELECT id FROM instructors WHERE user_id = $1`, [instructorUserId]);
    let instructorId: string;

    if (!existingProfile.length) {
      const result = await queryRunner.query(
        `INSERT INTO instructors (id, user_id, name, slug, short_bio, is_verified, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, 'John Instructor', 'john-instructor', 'Experienced software developer and educator', true, true, NOW(), NOW())
         RETURNING id`,
        [instructorUserId],
      );
      instructorId = result[0].id;
    } else {
      instructorId = existingProfile[0].id;
    }

    logger.info('Instructor created');

    // 10. Sample courses
    const programmingCat = await queryRunner.query(`SELECT id FROM course_categories WHERE slug = 'programming'`);
    const catId = programmingCat[0]?.id;

    if (catId && instructorId) {
      const sampleCourses = [
        {
          title: 'JavaScript Basics',
          slug: 'javascript-basics',
          subtitle: 'Learn JavaScript from scratch',
          short_description: 'Complete beginner guide to JavaScript',
          price: 0,
          is_free: true,
          level: 'beginner',
          status: 'published',
        },
        {
          title: 'React Masterclass',
          slug: 'react-masterclass',
          subtitle: 'Master React.js and build real applications',
          short_description: 'Advanced React with hooks, context, and performance',
          price: 499000,
          is_free: false,
          level: 'intermediate',
          status: 'published',
        },
        {
          title: 'Node.js Advanced',
          slug: 'nodejs-advanced',
          subtitle: 'Advanced Node.js patterns and practices',
          short_description: 'Deep dive into Node.js, APIs, and microservices',
          price: 699000,
          is_free: false,
          level: 'advanced',
          status: 'published',
        },
      ];

      for (const course of sampleCourses) {
        await queryRunner.query(
          `INSERT INTO courses (id, instructor_id, category_id, title, slug, subtitle, short_description, price, is_free, level, status, currency, published_at, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'VND', NOW(), NOW(), NOW())
           ON CONFLICT (slug) DO NOTHING`,
          [instructorId, catId, course.title, course.slug, course.subtitle, course.short_description, course.price, course.is_free, course.level, course.status],
        );
      }
      logger.info('Sample courses seeded');
    }

    await queryRunner.commitTransaction();
    logger.info('Database seeded successfully!');
    logger.info(`Admin: ${adminEmail} / ${env.SEED_ADMIN_PASSWORD}`);
    logger.info(`Instructor: ${instructorEmail} / Instructor@123`);
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
