import { AppDataSource } from '../../config/database.config';
import { OrganizationMember } from './entities/organization-member.entity';
import { AddMemberDto, UpdateMemberRoleDto, MemberQueryDto } from './dto/member.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class MemberService {
  private repo = AppDataSource.getRepository(OrganizationMember);

  async findAll(orgId: string, query: MemberQueryDto) {
    const { page = 1, limit = 10, search, role } = query;
    const qb = AppDataSource.createQueryBuilder()
      .select(['m.*', 'u.email', 'u.full_name as "fullName"', 'u.avatar_url as "avatarUrl"'])
      .from('organization_members', 'm')
      .innerJoin('users', 'u', 'u.id = m.user_id')
      .where('m.organization_id = :orgId', { orgId })
      .andWhere('m.is_active = true')
      .orderBy('m.joined_at', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (role) qb.andWhere('m.role = :role', { role });
    if (search) qb.andWhere('(u.email ILIKE :s OR u.full_name ILIKE :s)', { s: `%${search}%` });

    const members = await qb.getRawMany();
    const countResult = await AppDataSource.query(
      `SELECT COUNT(*) FROM organization_members WHERE organization_id = $1 AND is_active = true`,
      [orgId],
    );
    const total = parseInt(countResult[0].count);
    return { members, meta: buildPaginationMeta(page, limit, total) };
  }

  async addMember(orgId: string, dto: AddMemberDto, invitedBy: string): Promise<OrganizationMember> {
    const existing = await this.repo.findOne({ where: { organizationId: orgId, userId: dto.userId } });
    if (existing && existing.isActive) throw new ConflictError('User is already a member');

    if (existing) {
      existing.isActive = true;
      existing.role = dto.role ?? 'member';
      existing.joinedAt = new Date();
      return this.repo.save(existing);
    }

    return this.repo.save(this.repo.create({
      organizationId: orgId,
      userId: dto.userId,
      role: dto.role ?? 'member',
      invitedBy,
      invitedAt: new Date(),
      joinedAt: new Date(),
      isActive: true,
    }));
  }

  async updateRole(orgId: string, userId: string, dto: UpdateMemberRoleDto): Promise<OrganizationMember> {
    const m = await this.repo.findOne({ where: { organizationId: orgId, userId } });
    if (!m) throw new NotFoundError('Member');
    m.role = dto.role;
    return this.repo.save(m);
  }

  async removeMember(orgId: string, userId: string): Promise<void> {
    const m = await this.repo.findOne({ where: { organizationId: orgId, userId } });
    if (!m) throw new NotFoundError('Member');
    m.isActive = false;
    await this.repo.save(m);
  }
}
