import { AppDataSource } from '../../config/database.config';
import { Enrollment } from './entities/enrollment.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { Course } from '../course/entities/course.entity';
import { EnrollDto, EnrollmentQueryDto } from './dto/enrollment.dto';
import { NotFoundError, ConflictError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class EnrollmentService {
  private repo = AppDataSource.getRepository(Enrollment);
  private couponRepo = AppDataSource.getRepository(Coupon);
  private courseRepo = AppDataSource.getRepository(Course);

  async findAll(query: EnrollmentQueryDto) {
    const { page = 1, limit = 10, status, courseId, studentId } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('e').orderBy('e.enrolledAt', 'DESC').limit(limit).offset(offset);
    if (status) qb.where('e.status = :status', { status });
    if (courseId) qb.andWhere('e.courseId = :courseId', { courseId });
    if (studentId) qb.andWhere('e.studentId = :studentId', { studentId });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findMyEnrollments(studentId: string, query: any) {
    const { page = 1, limit = 10, status } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('e')
      .where('e.studentId = :studentId', { studentId })
      .orderBy('e.enrolledAt', 'DESC')
      .limit(limit).offset(offset);
    if (status) qb.andWhere('e.status = :status', { status });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const enrollment = await this.repo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundError('Enrollment');
    return enrollment;
  }

  async enroll(studentId: string, dto: EnrollDto) {
    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundError('Course');
    if (course.status !== 'published') throw new UnprocessableError('Course is not published');

    // Check if already enrolled
    const existing = await this.repo.findOne({ where: { courseId: dto.courseId, studentId } });
    if (existing) throw new ConflictError('Already enrolled in this course');

    let discountAmount = 0;
    let couponId: string | undefined;

    // Apply coupon if provided
    if (dto.couponCode) {
      const coupon = await this.couponRepo.findOne({ where: { code: dto.couponCode, isActive: true } });
      if (!coupon) throw new NotFoundError('Coupon');
      if (new Date() > coupon.expiresAt) throw new UnprocessableError('Coupon expired');
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new UnprocessableError('Coupon usage limit reached');
      if (coupon.minCoursePrice && course.price < coupon.minCoursePrice) throw new UnprocessableError('Course price below minimum for this coupon');

      if (coupon.type === 'percent') {
        discountAmount = (Number(course.price) * Number(coupon.value)) / 100;
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
      } else {
        discountAmount = Number(coupon.value);
      }
      couponId = coupon.id;
      await this.couponRepo.update(coupon.id, { usedCount: coupon.usedCount + 1 });
    }

    const total = Math.max(0, Number(course.price) - discountAmount);

    const enrollment = this.repo.create({
      courseId: dto.courseId,
      studentId,
      status: total === 0 ? 'active' : 'active',
      enrolledAt: new Date(),
      progressPercent: 0,
    });

    const saved = await this.repo.save(enrollment);

    // Update course enrollment count
    await AppDataSource.query(
      'UPDATE courses SET total_enrollments = total_enrollments + 1 WHERE id = $1',
      [course.id],
    );

    return { enrollment: saved, amount: course.price, discountAmount, total, couponId };
  }

  async updateProgress(enrollmentId: string, studentId: string) {
    const enrollment = await this.repo.findOne({ where: { id: enrollmentId, studentId } });
    if (!enrollment) throw new NotFoundError('Enrollment');

    // Calculate progress
    const result = await AppDataSource.query(
      `SELECT
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed') as completed_lessons
       FROM lessons l
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = $1
       WHERE l.course_id = $2 AND l.is_active = true`,
      [enrollmentId, enrollment.courseId],
    );

    const totalLessons = parseInt(result[0]?.total_lessons ?? 0);
    const completedLessons = parseInt(result[0]?.completed_lessons ?? 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    enrollment.progressPercent = progressPercent;
    if (progressPercent === 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    return this.repo.save(enrollment);
  }
}
