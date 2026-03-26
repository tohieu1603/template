import { AppDataSource } from '../../config/database.config';
import { SectionTemplate } from './entities/section-template.entity';
import { CreateSectionTemplateDto, UpdateSectionTemplateDto, SectionTemplateQueryDto } from './dto/section-template.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class SectionTemplateService {
  private repo = AppDataSource.getRepository(SectionTemplate);

  async findAll(query: SectionTemplateQueryDto) {
    const { page = 1, limit = 20, search, sectionType } = query;
    const qb = this.repo.createQueryBuilder('t').orderBy('t.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('t.name ILIKE :s', { s: `%${search}%` });
    if (sectionType) qb.andWhere('t.sectionType = :sectionType', { sectionType });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const template = await this.repo.findOne({ where: { id } });
    if (!template) throw new NotFoundError('Section template');
    return template;
  }

  async create(dto: CreateSectionTemplateDto) {
    const template = this.repo.create(dto);
    return this.repo.save(template);
  }

  async update(id: string, dto: UpdateSectionTemplateDto) {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return this.repo.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.repo.remove(template);
  }
}
