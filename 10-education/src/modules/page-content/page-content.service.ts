import { AppDataSource } from '../../config/database.config';
import { PageContent } from './entities/page-content.entity';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class PageContentService {
  private repo = AppDataSource.getRepository(PageContent);

  async findAll(query: any) {
    const { page = 1, limit = 10, search } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC').limit(limit).offset(offset);
    if (search) qb.where('p.title ILIKE :s OR p.slug ILIKE :s', { s: `%${search}%` });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findBySlug(slug: string) {
    const page = await this.repo.findOne({ where: { slug } });
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async create(dto: any) {
    const slug = generateSlug(dto.slug || dto.title);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError('Slug already exists');
    const page = this.repo.create({ ...dto, slug });
    return this.repo.save(page);
  }

  async update(slug: string, dto: any) {
    const page = await this.repo.findOne({ where: { slug } });
    if (!page) throw new NotFoundError('Page');
    Object.assign(page, dto);
    return this.repo.save(page);
  }

  async delete(slug: string) {
    const page = await this.repo.findOne({ where: { slug } });
    if (!page) throw new NotFoundError('Page');
    await this.repo.remove(page);
  }
}
