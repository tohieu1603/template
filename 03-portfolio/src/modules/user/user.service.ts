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
    const qb = this.repo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(u.email ILIKE :s OR u.fullName ILIKE :s)', { s: `%${search}%` });
    if (isActive !== undefined) qb.andWhere('u.isActive = :isActive', { isActive: isActive === 'true' });
    const [users, total] = await qb.getManyAndCount();
    return { users: users.map(this.sanitize), meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    return this.sanitize(user);
  }

  async create(dto: CreateUserDto) {
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

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    Object.assign(user, dto);
    return this.sanitize(await this.repo.save(user));
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    const valid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');
    user.passwordHash = await hashPassword(dto.newPassword);
    await this.repo.save(user);
  }

  async assignRole(id: string, roleId: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    await AppDataSource.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id, roleId],
    );
  }

  async removeRole(id: string, roleId: string) {
    await AppDataSource.query(`DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`, [id, roleId]);
  }

  async delete(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    await this.repo.remove(user);
  }

  private sanitize(user: User) {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
