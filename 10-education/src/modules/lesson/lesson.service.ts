import { AppDataSource } from '../../config/database.config';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto, UpdateLessonDto, LessonQueryDto } from './dto/lesson.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class LessonService {
  private repo = AppDataSource.getRepository(Lesson);

  async findAll(query: LessonQueryDto) {
    const { page = 1, limit = 20, search, courseId, sectionId } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('l').orderBy('l.sortOrder', 'ASC').limit(limit).offset(offset);
    if (search) qb.where('l.title ILIKE :s', { s: `%${search}%` });
    if (courseId) qb.andWhere('l.courseId = :courseId', { courseId });
    if (sectionId) qb.andWhere('l.sectionId = :sectionId', { sectionId });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const lesson = await this.repo.findOne({ where: { id } });
    if (!lesson) throw new NotFoundError('Lesson');
    return lesson;
  }

  async findBySlug(slug: string) {
    const lesson = await this.repo.findOne({ where: { slug } });
    if (!lesson) throw new NotFoundError('Lesson');
    return lesson;
  }

  async create(dto: CreateLessonDto) {
    const slug = `${generateSlug(dto.title)}-${Date.now()}`;
    const lesson = this.repo.create({ ...dto, slug });
    return this.repo.save(lesson);
  }

  async update(id: string, dto: UpdateLessonDto) {
    const lesson = await this.repo.findOne({ where: { id } });
    if (!lesson) throw new NotFoundError('Lesson');
    if (dto.title) lesson.slug = `${generateSlug(dto.title)}-${Date.now()}`;
    Object.assign(lesson, dto);
    return this.repo.save(lesson);
  }

  async delete(id: string) {
    const lesson = await this.repo.findOne({ where: { id } });
    if (!lesson) throw new NotFoundError('Lesson');
    await this.repo.remove(lesson);
  }
}
