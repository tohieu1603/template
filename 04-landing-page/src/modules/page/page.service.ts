import { AppDataSource } from '../../config/database.config';
import { Page } from './entities/page.entity';
import { CreatePageDto, UpdatePageDto, PageQueryDto } from './dto/page.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class PageService {
  private repo = AppDataSource.getRepository(Page);

  async findAll(query: PageQueryDto) {
    const { page = 1, limit = 10, search, status, template } = query;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(p.title ILIKE :s OR p.slug ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('p.status = :status', { status });
    if (template) qb.andWhere('p.template = :template', { template });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const page = await this.repo.findOne({ where: { id } });
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async findBySlug(slug: string) {
    const page = await this.repo.findOne({ where: { slug } });
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async create(dto: CreatePageDto, userId: string) {
    const slug = dto.slug ?? generateSlug(dto.title);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError('Slug already exists');

    const page = this.repo.create({ ...dto, slug, createdBy: userId });
    return this.repo.save(page);
  }

  async update(id: string, dto: UpdatePageDto) {
    const page = await this.findOne(id);
    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.repo.findOne({ where: { slug: dto.slug } });
      if (existing) throw new ConflictError('Slug already exists');
    }
    Object.assign(page, dto);
    return this.repo.save(page);
  }

  async publish(id: string) {
    const page = await this.findOne(id);
    page.status = 'published';
    page.publishedAt = new Date();
    return this.repo.save(page);
  }

  async unpublish(id: string) {
    const page = await this.findOne(id);
    page.status = 'draft';
    return this.repo.save(page);
  }

  async duplicate(id: string, userId: string) {
    const page = await this.findOne(id);
    const newSlug = generateSlug(`${page.title}-copy-${Date.now()}`);
    const newPage = this.repo.create({
      ...page,
      id: undefined,
      title: `${page.title} (Copy)`,
      slug: newSlug,
      status: 'draft',
      isHomepage: false,
      publishedAt: undefined,
      createdBy: userId,
    });
    return this.repo.save(newPage);
  }

  async remove(id: string): Promise<void> {
    const page = await this.findOne(id);
    await this.repo.remove(page);
  }
}
