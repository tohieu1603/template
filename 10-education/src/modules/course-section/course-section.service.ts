import { AppDataSource } from '../../config/database.config';
import { CourseSection } from './entities/course-section.entity';
import { CreateCourseSectionDto, UpdateCourseSectionDto } from './dto/course-section.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class CourseSectionService {
  private repo = AppDataSource.getRepository(CourseSection);

  async findByCourse(courseId: string) {
    return this.repo.find({ where: { courseId }, order: { sortOrder: 'ASC' } });
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, courseId } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('s').orderBy('s.sortOrder', 'ASC').limit(limit).offset(offset);
    if (courseId) qb.where('s.courseId = :courseId', { courseId });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const section = await this.repo.findOne({ where: { id } });
    if (!section) throw new NotFoundError('Section');
    return section;
  }

  async create(dto: CreateCourseSectionDto) {
    const section = this.repo.create(dto);
    return this.repo.save(section);
  }

  async update(id: string, dto: UpdateCourseSectionDto) {
    const section = await this.repo.findOne({ where: { id } });
    if (!section) throw new NotFoundError('Section');
    Object.assign(section, dto);
    return this.repo.save(section);
  }

  async delete(id: string) {
    const section = await this.repo.findOne({ where: { id } });
    if (!section) throw new NotFoundError('Section');
    await this.repo.remove(section);
  }
}
