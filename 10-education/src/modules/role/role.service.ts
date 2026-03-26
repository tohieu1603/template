import { In } from 'typeorm';
import { AppDataSource } from '../../config/database.config';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/role.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class RoleService {
  private roleRepo = AppDataSource.getRepository(Role);
  private permRepo = AppDataSource.getRepository(Permission);

  async findAll(query: any) {
    const { page = 1, limit = 10, search } = query;
    const offset = (page - 1) * limit;

    const qb = this.roleRepo.createQueryBuilder('r').orderBy('r.createdAt', 'DESC').limit(limit).offset(offset);
    if (search) qb.where('r.name ILIKE :s OR r.displayName ILIKE :s', { s: `%${search}%` });

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const role = await this.roleRepo.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) throw new NotFoundError('Role');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictError('Role name already exists');
    const role = this.roleRepo.create(dto);
    return this.roleRepo.save(role);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundError('Role');
    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async delete(id: string) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundError('Role');
    await this.roleRepo.remove(role);
  }

  async assignPermissions(id: string, dto: AssignPermissionsDto) {
    const role = await this.roleRepo.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) throw new NotFoundError('Role');
    const permissions = await this.permRepo.findBy({ id: In(dto.permissionIds) });
    role.permissions = permissions;
    return this.roleRepo.save(role);
  }

  async findAllPermissions(query: any) {
    const { page = 1, limit = 100, search } = query;
    const offset = (page - 1) * limit;
    const qb = this.permRepo.createQueryBuilder('p').orderBy('p.groupName', 'ASC').addOrderBy('p.name', 'ASC').limit(limit).offset(offset);
    if (search) qb.where('p.name ILIKE :s OR p.displayName ILIKE :s', { s: `%${search}%` });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async assignRoleToUser(userId: string, roleId: string) {
    await AppDataSource.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, roleId],
    );
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    await AppDataSource.query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, roleId],
    );
  }
}
