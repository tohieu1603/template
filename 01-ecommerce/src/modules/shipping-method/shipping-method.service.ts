import { AppDataSource } from '../../config/database.config';
import { ShippingMethod } from './entities/shipping-method.entity';
import { CreateShippingMethodDto, UpdateShippingMethodDto, ShippingMethodQueryDto } from './dto/shipping-method.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ShippingMethodService {
  private repo = AppDataSource.getRepository(ShippingMethod);

  async findAll(query: ShippingMethodQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const qb = this.repo.createQueryBuilder('s').orderBy('s.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (status !== undefined) qb.where('s.isActive = :active', { active: status === 'active' });

    const [methods, total] = await qb.getManyAndCount();
    return { methods, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<ShippingMethod> {
    const method = await this.repo.findOne({ where: { id } });
    if (!method) throw new NotFoundError('Shipping method');
    return method;
  }

  async create(dto: CreateShippingMethodDto): Promise<ShippingMethod> {
    const existing = await this.repo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictError(`Code '${dto.code}' already in use`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateShippingMethodDto): Promise<ShippingMethod> {
    const method = await this.findById(id);
    Object.assign(method, dto);
    return this.repo.save(method);
  }

  async delete(id: string): Promise<void> {
    const method = await this.findById(id);
    await this.repo.remove(method);
  }
}
