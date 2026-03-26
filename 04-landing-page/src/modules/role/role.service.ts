import { AppDataSource } from '../../config/database.config';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, RoleQueryDto } from './dto/role.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class RoleService {
  private roleRepo = AppDataSource.getRepository(Role);
  private permRepo = AppDataSource.getRepository(Permission);

  async findAllRoles(query: RoleQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const offset = (page - 1) * limit;
    const qb = this.roleRepo.createQueryBuilder('r').orderBy('r.createdAt', 'DESC').limit(limit).offset(offset);
    if (search) qb.where('r.name ILIKE :s OR r.displayName ILIKE :s', { s: `%${search}%` });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOneRole(id: string) {
    const role = await this.roleRepo.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) throw new NotFoundError('Role');
    return role;
  }

  async createRole(dto: CreateRoleDto) {
    const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictError('Role name already exists');
    const role = this.roleRepo.create(dto);
    return this.roleRepo.save(role);
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundError('Role');
    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundError('Role');
    await this.roleRepo.remove(role);
  }

  async assignPermissions(id: string, dto: AssignPermissionsDto) {
    const role = await this.roleRepo.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) throw new NotFoundError('Role');
    const permissions = await this.permRepo.findByIds(dto.permissionIds);
    role.permissions = permissions;
    return this.roleRepo.save(role);
  }

  async findAllPermissions() {
    return this.permRepo.find({ order: { groupName: 'ASC', name: 'ASC' } });
  }
}
