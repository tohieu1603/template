import { AppDataSource } from '../../config/database.config';
import { Tag } from './entities/tag.entity';
import { CreateTagDto, UpdateTagDto, TagQueryDto } from './dto/tag.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { generateSlug } from '../../common/utils/slug.util';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class TagService {
  private repo = AppDataSource.getRepository(Tag);

  async findAll(query: TagQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const offset = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('t')
      .orderBy('t.name', 'ASC')
      .limit(limit)
      .offset(offset);

    if (search) {
      qb.where('(t.name ILIKE :s OR t.description ILIKE :s)', { s: `%${search}%` });
    }
    if (status !== undefined) {
      qb.andWhere('t.isActive = :active', { active: status === 'active' });
    }

    const [tags, total] = await qb.getManyAndCount();
    return { tags, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Tag> {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundError('Tag');
    return tag;
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.repo.findOne({ where: { slug } });
    if (!tag) throw new NotFoundError('Tag');
    return tag;
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const slug = dto.slug ?? generateSlug(dto.name);

    const existingSlug = await this.repo.findOne({ where: { slug } });
    if (existingSlug) throw new ConflictError(`Slug '${slug}' already in use`);

    const existingName = await this.repo.findOne({ where: { name: dto.name } });
    if (existingName) throw new ConflictError(`Tag name '${dto.name}' already in use`);

    const tag = this.repo.create({ ...dto, slug });
    return this.repo.save(tag);
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundError('Tag');

    if (dto.slug && dto.slug !== tag.slug) {
      const existing = await this.repo.findOne({ where: { slug: dto.slug } });
      if (existing) throw new ConflictError(`Slug '${dto.slug}' already in use`);
    }

    Object.assign(tag, dto);
    return this.repo.save(tag);
  }

  async delete(id: string): Promise<void> {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundError('Tag');
    await this.repo.remove(tag);
  }
}
