import { AppDataSource } from '../../config/database.config';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { hashPassword } from '../../common/utils/password.util';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class UserService {
  private repo = AppDataSource.getRepository(User);

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const offset = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC').limit(limit).offset(offset);

    if (search) qb.where('(u.email ILIKE :s OR u.fullName ILIKE :s)', { s: `%${search}%` });
    if (status === 'active') qb.andWhere('u.isActive = true');
    if (status === 'inactive') qb.andWhere('u.isActive = false');

    const [items, total] = await qb.getManyAndCount();
    return { items: items.map(this.sanitize), meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id }, relations: ['roles'] });
    if (!user) throw new NotFoundError('User');
    return this.sanitize(user);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictError('Email already registered');
    const passwordHash = await hashPassword(dto.password);
    const user = this.repo.create({ email: dto.email, passwordHash, fullName: dto.fullName, phone: dto.phone, avatarUrl: dto.avatarUrl });
    const saved = await this.repo.save(user);
    return this.sanitize(saved);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    return this.sanitize(saved);
  }

  async remove(id: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    await this.repo.remove(user);
  }

  private sanitize(user: User): Partial<User> {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
