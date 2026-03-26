import { AppDataSource } from '../../config/database.config';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from './dto/course.dto';
import { NotFoundError, ConflictError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class CourseService {
  private repo = AppDataSource.getRepository(Course);

  async findAll(query: CourseQueryDto) {
    const { page = 1, limit = 10, search, categoryId, instructorId, level, status, isFree, isFeatured, minPrice, maxPrice, minRating, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('c')
      .orderBy(`c.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .limit(limit).offset(offset);

    if (search) qb.where('(c.title ILIKE :s OR c.shortDescription ILIKE :s)', { s: `%${search}%` });
    if (categoryId) qb.andWhere('c.categoryId = :categoryId', { categoryId });
    if (instructorId) qb.andWhere('c.instructorId = :instructorId', { instructorId });
    if (level) qb.andWhere('c.level = :level', { level });
    if (status) qb.andWhere('c.status = :status', { status });
    if (isFree !== undefined) qb.andWhere('c.isFree = :isFree', { isFree: isFree === 'true' });
    if (isFeatured !== undefined) qb.andWhere('c.isFeatured = :isFeatured', { isFeatured: isFeatured === 'true' });
    if (minPrice !== undefined) qb.andWhere('c.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined) qb.andWhere('c.price <= :maxPrice', { maxPrice });
    if (minRating !== undefined) qb.andWhere('c.ratingAvg >= :minRating', { minRating });

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const course = await this.repo.findOne({ where: { id } });
    if (!course) throw new NotFoundError('Course');
    return course;
  }

  async findBySlug(slug: string) {
    const course = await this.repo.findOne({ where: { slug } });
    if (!course) throw new NotFoundError('Course');
    return course;
  }

  async create(dto: CreateCourseDto) {
    const slug = generateSlug(dto.title);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError('Course slug already exists');
    const course = this.repo.create({ ...dto, slug });
    // Explicitly set status (TypeORM default may override dto spread)
    if (dto.status) course.status = dto.status;
    if (course.status === 'published' && !course.publishedAt) {
      (course as any).publishedAt = new Date();
    }
    return this.repo.save(course);
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.repo.findOne({ where: { id } });
    if (!course) throw new NotFoundError('Course');
    if (dto.title) course.slug = generateSlug(dto.title);
    Object.assign(course, dto);
    return this.repo.save(course);
  }

  async publish(id: string) {
    const course = await this.repo.findOne({ where: { id } });
    if (!course) throw new NotFoundError('Course');
    course.status = 'published';
    course.publishedAt = new Date();
    return this.repo.save(course);
  }

  async unpublish(id: string) {
    const course = await this.repo.findOne({ where: { id } });
    if (!course) throw new NotFoundError('Course');
    course.status = 'draft';
    return this.repo.save(course);
  }

  async delete(id: string) {
    const course = await this.repo.findOne({ where: { id } });
    if (!course) throw new NotFoundError('Course');
    await this.repo.remove(course);
  }
}
