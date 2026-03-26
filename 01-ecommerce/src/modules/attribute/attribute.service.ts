import { AppDataSource } from '../../config/database.config';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { CreateAttributeDto, UpdateAttributeDto, CreateAttributeValueDto } from './dto/attribute.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { generateSlug } from '../../common/utils/slug.util';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class AttributeService {
  private attrRepo = AppDataSource.getRepository(Attribute);
  private valueRepo = AppDataSource.getRepository(AttributeValue);

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 20, search } = query;

    const qb = this.attrRepo.createQueryBuilder('a').orderBy('a.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('a.name ILIKE :s', { s: `%${search}%` });

    const [attributes, total] = await qb.getManyAndCount();

    // Load values for each attribute
    const withValues = await Promise.all(
      attributes.map(async (attr) => ({
        ...attr,
        values: await this.valueRepo.find({ where: { attributeId: attr.id }, order: { sortOrder: 'ASC' } }),
      })),
    );

    return { attributes: withValues, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const attr = await this.attrRepo.findOne({ where: { id } });
    if (!attr) throw new NotFoundError('Attribute');
    const values = await this.valueRepo.find({ where: { attributeId: id }, order: { sortOrder: 'ASC' } });
    return { ...attr, values };
  }

  async create(dto: CreateAttributeDto) {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.attrRepo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Attribute slug '${slug}' already exists`);

    const attr = await this.attrRepo.save(this.attrRepo.create({ ...dto, slug }));

    if (dto.values?.length) {
      const values = dto.values.map((v) =>
        this.valueRepo.create({ ...v, attributeId: attr.id }),
      );
      await this.valueRepo.save(values);
    }

    return this.findById(attr.id);
  }

  async update(id: string, dto: UpdateAttributeDto) {
    const attr = await this.attrRepo.findOne({ where: { id } });
    if (!attr) throw new NotFoundError('Attribute');
    Object.assign(attr, dto);
    return this.attrRepo.save(attr);
  }

  async delete(id: string): Promise<void> {
    const attr = await this.attrRepo.findOne({ where: { id } });
    if (!attr) throw new NotFoundError('Attribute');
    await this.valueRepo.delete({ attributeId: id });
    await this.attrRepo.remove(attr);
  }

  async addValue(attributeId: string, dto: CreateAttributeValueDto) {
    const attr = await this.attrRepo.findOne({ where: { id: attributeId } });
    if (!attr) throw new NotFoundError('Attribute');
    return this.valueRepo.save(this.valueRepo.create({ ...dto, attributeId }));
  }

  async deleteValue(valueId: string): Promise<void> {
    const value = await this.valueRepo.findOne({ where: { id: valueId } });
    if (!value) throw new NotFoundError('Attribute value');
    await this.valueRepo.remove(value);
  }
}
