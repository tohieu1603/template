import { AppDataSource } from '../../config/database.config';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { hashPassword } from '../../common/utils/password.util';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class UserService {
  private repo = AppDataSource.getRepository(User);

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('u')
      .select(['u.id', 'u.email', 'u.fullName', 'u.phone', 'u.avatarUrl', 'u.isActive', 'u.isVerified', 'u.lastLoginAt', 'u.createdAt', 'u.updatedAt'])
      .orderBy(`u.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .limit(limit).offset(offset);

    if (search) qb.where('(u.email ILIKE :s OR u.fullName ILIKE :s)', { s: `%${search}%` });
    if (status === 'active') qb.andWhere('u.isActive = true');
    if (status === 'inactive') qb.andWhere('u.isActive = false');

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictError('Email already exists');

    const passwordHash = await hashPassword(dto.password);
    const user = this.repo.create({ email: dto.email, passwordHash, fullName: dto.fullName, phone: dto.phone });
    const saved = await this.repo.save(user);

    await AppDataSource.query(
      `INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE is_default = true LIMIT 1 ON CONFLICT DO NOTHING`,
      [saved.id],
    );

    const { passwordHash: ph, ...safe } = saved as any;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    const { passwordHash, ...safe } = saved as any;
    return safe;
  }

  async delete(id: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    await this.repo.remove(user);
  }
}
