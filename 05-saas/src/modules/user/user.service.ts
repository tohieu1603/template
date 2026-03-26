import { AppDataSource } from '../../config/database.config';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, UserQueryDto } from './dto/user.dto';
import { hashPassword, comparePassword } from '../../common/utils/password.util';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class UserService {
  private repo = AppDataSource.getRepository(User);

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, isActive } = query;
    const qb = this.repo.createQueryBuilder('u')
      .orderBy('u.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (search) qb.where('(u.email ILIKE :s OR u.fullName ILIKE :s)', { s: `%${search}%` });
    if (isActive !== undefined) qb.andWhere('u.isActive = :isActive', { isActive: isActive === 'true' });

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
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await hashPassword(dto.password);
    const user = this.repo.create({ email: dto.email, passwordHash, fullName: dto.fullName, phone: dto.phone });
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
    const saved = await this.repo.save(user);
    return this.sanitize(saved);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    const valid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');
    user.passwordHash = await hashPassword(dto.newPassword);
    await this.repo.save(user);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');
    await AppDataSource.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, roleId],
    );
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await AppDataSource.query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, roleId],
    );
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
