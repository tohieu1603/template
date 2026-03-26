import { AppDataSource } from '../../config/database.config';
import { CustomerProfile } from './entities/customer-profile.entity';
import { CreateCustomerProfileDto, UpdateCustomerProfileDto, CustomerProfileQueryDto } from './dto/customer-profile.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class CustomerProfileService {
  private repo = AppDataSource.getRepository(CustomerProfile);

  async findAll(query: CustomerProfileQueryDto) {
    const { page = 1, limit = 20, search } = query;
    const qb = this.repo.createQueryBuilder('cp')
      .leftJoin('users', 'u', 'u.id = cp.user_id')
      .addSelect(['u.email', 'u.full_name'])
      .orderBy('cp.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (search) {
      qb.where('cp.phone ILIKE :s', { s: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findByUserId(userId: string): Promise<CustomerProfile> {
    const item = await this.repo.findOne({ where: { userId } });
    if (!item) throw new NotFoundError('Customer profile');
    return item;
  }

  async findById(id: string): Promise<CustomerProfile> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Customer profile');
    return item;
  }

  async create(userId: string, dto: CreateCustomerProfileDto): Promise<CustomerProfile> {
    const existing = await this.repo.findOne({ where: { userId } });
    if (existing) throw new ConflictError('Customer profile already exists for this user');
    return this.repo.save(this.repo.create({ userId, ...dto }));
  }

  async update(id: string, dto: UpdateCustomerProfileDto): Promise<CustomerProfile> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Customer profile');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async upsertForUser(userId: string, dto: UpdateCustomerProfileDto): Promise<CustomerProfile> {
    const existing = await this.repo.findOne({ where: { userId } });
    if (existing) {
      Object.assign(existing, dto);
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ userId, ...dto }));
  }

  async delete(id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Customer profile');
    await this.repo.remove(item);
  }
}
