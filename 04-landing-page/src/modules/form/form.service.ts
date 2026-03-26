import { AppDataSource } from '../../config/database.config';
import { Form } from './entities/form.entity';
import { CreateFormDto, UpdateFormDto, FormQueryDto } from './dto/form.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class FormService {
  private repo = AppDataSource.getRepository(Form);

  async findAll(query: FormQueryDto) {
    const { page = 1, limit = 10, search, pageId } = query;
    const qb = this.repo.createQueryBuilder('f').orderBy('f.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('f.name ILIKE :s', { s: `%${search}%` });
    if (pageId) qb.andWhere('f.pageId = :pageId', { pageId });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const form = await this.repo.findOne({ where: { id } });
    if (!form) throw new NotFoundError('Form');
    return form;
  }

  async findBySlug(slug: string) {
    const form = await this.repo.findOne({ where: { slug } });
    if (!form) throw new NotFoundError('Form');
    return form;
  }

  async create(dto: CreateFormDto) {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError('Form slug already exists');
    const form = this.repo.create({ ...dto, slug });
    return this.repo.save(form);
  }

  async update(id: string, dto: UpdateFormDto) {
    const form = await this.findOne(id);
    Object.assign(form, dto);
    return this.repo.save(form);
  }

  async remove(id: string): Promise<void> {
    const form = await this.findOne(id);
    await this.repo.remove(form);
  }

  async incrementSubmissionCount(id: string): Promise<void> {
    await this.repo.increment({ id }, 'submissionCount', 1);
  }
}
