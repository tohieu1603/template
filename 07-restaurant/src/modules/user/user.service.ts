import { AppDataSource } from '../../config/database.config';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { hashPassword } from '../../common/utils/password.util';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class UserService {
  private repo = AppDataSource.getRepository(User);

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('u.email ILIKE :s OR u.fullName ILIKE :s', { s: `%${search}%` });
    if (query.isActive !== undefined) qb.andWhere('u.isActive = :isActive', { isActive: query.isActive });
    const [users, total] = await qb.getManyAndCount();
    return { users: users.map(u => this.sanitize(u)), meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    return this.sanitize(user);
  }

  async create(dto: CreateUserDto): Promise<Partial<User>> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictError('Email already registered');
    const passwordHash = await hashPassword(dto.password);
    const user = this.repo.create({ ...dto, passwordHash });
    const saved = await this.repo.save(user);
    await AppDataSource.query(
      `INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE is_default = true LIMIT 1 ON CONFLICT DO NOTHING`,
      [saved.id],
    );
    return this.sanitize(saved);
  }

  async update(id: string, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    Object.assign(user, dto);
    return this.sanitize(await this.repo.save(user));
  }

  async delete(id: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    await this.repo.remove(user);
  }

  private sanitize(user: User): Partial<User> {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
