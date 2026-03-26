import { AppDataSource } from '../../config/database.config';
import { Review } from './entities/review.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Course } from '../course/entities/course.entity';
import { CreateReviewDto, UpdateReviewDto, AdminReplyDto, ReviewQueryDto } from './dto/review.dto';
import { ConflictError, NotFoundError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ReviewService {
  private repo = AppDataSource.getRepository(Review);
  private enrollmentRepo = AppDataSource.getRepository(Enrollment);
  private courseRepo = AppDataSource.getRepository(Course);

  async findAll(query: ReviewQueryDto) {
    const { page = 1, limit = 10, search, courseId, isVisible } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('r').orderBy('r.createdAt', 'DESC').limit(limit).offset(offset);
    if (search) qb.where('r.comment ILIKE :s', { s: `%${search}%` });
    if (courseId) qb.andWhere('r.courseId = :courseId', { courseId });
    if (isVisible !== undefined) qb.andWhere('r.isVisible = :isVisible', { isVisible });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const review = await this.repo.findOne({ where: { id } });
    if (!review) throw new NotFoundError('Review');
    return review;
  }

  async create(studentId: string, dto: CreateReviewDto) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: dto.enrollmentId, studentId } });
    if (!enrollment) throw new NotFoundError('Enrollment');
    if (enrollment.progressPercent < 100) throw new UnprocessableError('Must complete course before reviewing');

    const existing = await this.repo.findOne({ where: { enrollmentId: dto.enrollmentId } });
    if (existing) throw new ConflictError('Review already submitted for this enrollment');

    const review = this.repo.create({ ...dto, studentId });
    const saved = await this.repo.save(review);

    // Update course rating
    await this.updateCourseRating(dto.courseId);
    return saved;
  }

  async update(id: string, studentId: string, dto: UpdateReviewDto) {
    const review = await this.repo.findOne({ where: { id, studentId } });
    if (!review) throw new NotFoundError('Review');
    Object.assign(review, dto);
    const saved = await this.repo.save(review);
    await this.updateCourseRating(review.courseId);
    return saved;
  }

  async adminReply(id: string, dto: AdminReplyDto) {
    const review = await this.repo.findOne({ where: { id } });
    if (!review) throw new NotFoundError('Review');
    review.adminReply = dto.adminReply;
    return this.repo.save(review);
  }

  async delete(id: string) {
    const review = await this.repo.findOne({ where: { id } });
    if (!review) throw new NotFoundError('Review');
    const courseId = review.courseId;
    await this.repo.remove(review);
    await this.updateCourseRating(courseId);
  }

  private async updateCourseRating(courseId: string) {
    const result = await AppDataSource.query(
      `SELECT AVG(rating) as avg_rating FROM reviews WHERE course_id = $1 AND is_visible = true`,
      [courseId],
    );
    const avgRating = result[0]?.avg_rating ? parseFloat(result[0].avg_rating).toFixed(2) : 0;
    await this.courseRepo.update(courseId, { ratingAvg: avgRating as any });
  }
}
