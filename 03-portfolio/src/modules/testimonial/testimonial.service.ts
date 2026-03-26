import { AppDataSource } from '../../config/database.config';
import { Testimonial } from './entities/testimonial.entity';
import { CreateTestimonialDto, UpdateTestimonialDto, TestimonialQueryDto } from './dto/testimonial.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class TestimonialService {
  private repo = AppDataSource.getRepository(Testimonial);

  async findAll(query: TestimonialQueryDto) {
    const { page = 1, limit = 10, profileId, isVisible, isFeatured } = query;
    const qb = this.repo.createQueryBuilder('t').orderBy('t.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (profileId) qb.where('t.profileId = :profileId', { profileId });
    if (isVisible !== undefined) qb.andWhere('t.isVisible = :isVisible', { isVisible: isVisible === 'true' });
    if (isFeatured !== undefined) qb.andWhere('t.isFeatured = :isFeatured', { isFeatured: isFeatured === 'true' });
    const [testimonials, total] = await qb.getManyAndCount();
    return { testimonials, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundError('Testimonial');
    return t;
  }

  async create(dto: CreateTestimonialDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const t = await this.findById(id);
    Object.assign(t, dto);
    return this.repo.save(t);
  }

  async delete(id: string) {
    const t = await this.findById(id);
    await this.repo.remove(t);
  }
}
