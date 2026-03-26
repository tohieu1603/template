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
    const params: any[] = [];
    let idx = 1;

    let sql = `
      SELECT r.id, r.name, r.display_name, r.description, r.is_default, r.created_at, r.updated_at,
             COALESCE(json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name, 'display_name', p.display_name, 'group_name', p.group_name))
               FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE 1=1
    `;

    if (search) {
      sql += ` AND (r.name ILIKE $${idx} OR r.display_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ` GROUP BY r.id ORDER BY r.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const [roles, total] = await Promise.all([
      AppDataSource.query(sql, params),
      this.roleRepo.count(),
    ]);

    return { roles, meta: buildPaginationMeta(page, limit, total) };
  }

  async findRoleById(id: string) {
    const result = await AppDataSource.query(
      `SELECT r.*, COALESCE(json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name, 'display_name', p.display_name, 'group_name', p.group_name))
         FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
       FROM roles r
       LEFT JOIN role_permissions rp ON rp.role_id = r.id
       LEFT JOIN permissions p ON p.id = rp.permission_id
       WHERE r.id = $1
       GROUP BY r.id`,
      [id],
    );
    if (!result.length) throw new NotFoundError('Role');
    return result[0];
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictError(`Role '${dto.name}' already exists`);
    return this.roleRepo.save(this.roleRepo.create(dto));
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
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

  async assignPermissions(roleId: string, dto: AssignPermissionsDto): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundError('Role');

    await AppDataSource.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

    if (dto.permissionIds.length > 0) {
      const values = dto.permissionIds.map((pid) => `('${roleId}', '${pid}')`).join(',');
      await AppDataSource.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values} ON CONFLICT DO NOTHING`);
    }
  }

  async findAllPermissions(query: RoleQueryDto) {
    const { page = 1, limit = 100, search } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let idx = 1;

    let sql = `SELECT * FROM permissions WHERE 1=1`;
    if (search) {
      sql += ` AND (name ILIKE $${idx} OR display_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    sql += ` ORDER BY group_name, name LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const [permissions, countResult] = await Promise.all([
      AppDataSource.query(sql, params),
      AppDataSource.query('SELECT COUNT(*) FROM permissions'),
    ]);

    return { permissions, meta: buildPaginationMeta(page, limit, parseInt(countResult[0].count, 10)) };
  }
}
