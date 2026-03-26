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
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let idx = 1;

    let sql = `
      SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.is_active,
             u.email_verified_at, u.last_login_at, u.created_at, u.updated_at,
             COALESCE(json_agg(DISTINCT jsonb_build_object('id', r.id, 'name', r.name))
               FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE 1=1
    `;

    if (search) {
      sql += ` AND (u.email ILIKE $${idx} OR u.full_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (isActive !== undefined) {
      sql += ` AND u.is_active = $${idx}`;
      params.push(isActive === 'true');
      idx++;
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    let countSql = `SELECT COUNT(*) FROM users u WHERE 1=1`;
    if (search) countSql += ` AND (u.email ILIKE '%${search}%' OR u.full_name ILIKE '%${search}%')`;
    if (isActive !== undefined) countSql += ` AND u.is_active = ${isActive === 'true'}`;

    const [users, countResult] = await Promise.all([
      AppDataSource.query(sql, params),
      AppDataSource.query(countSql),
    ]);

    return { users, meta: buildPaginationMeta(page, limit, parseInt(countResult[0].count, 10)) };
  }

  async findById(id: string) {
    const result = await AppDataSource.query(
      `SELECT u.*, COALESCE(json_agg(DISTINCT jsonb_build_object('id', r.id, 'name', r.name))
         FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id],
    );
    if (!result.length) throw new NotFoundError('User');
    const user = result[0];
    delete user.password_hash;
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await hashPassword(dto.password);
    const user = this.repo.create({ ...dto, passwordHash });
    const saved = await this.repo.save(user);
    const { passwordHash: _, ...safe } = saved as any;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    const { passwordHash: _, ...safe } = saved as any;
    return safe;
  }

  async delete(id: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User');
    await this.repo.remove(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.repo.findOne({ where: { id: userId } });
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
}
