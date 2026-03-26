import crypto from 'crypto';
import { AppDataSource } from '../../config/database.config';
import { Invitation } from './entities/invitation.entity';
import { CreateInvitationDto, InvitationQueryDto } from './dto/invitation.dto';
import { NotFoundError, ConflictError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class InvitationService {
  private repo = AppDataSource.getRepository(Invitation);

  async findAll(orgId: string, query: InvitationQueryDto) {
    const { page = 1, limit = 10, status } = query;
    const qb = this.repo.createQueryBuilder('i')
      .where('i.organizationId = :orgId', { orgId })
      .orderBy('i.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    if (status) qb.andWhere('i.status = :status', { status });
    const [invitations, total] = await qb.getManyAndCount();
    return { invitations, meta: buildPaginationMeta(page, limit, total) };
  }

  async create(orgId: string, dto: CreateInvitationDto, invitedBy: string): Promise<Invitation> {
    const existing = await this.repo.findOne({
      where: { organizationId: orgId, email: dto.email, status: 'pending' },
    });
    if (existing) throw new ConflictError('Invitation already sent to this email');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return this.repo.save(this.repo.create({
      organizationId: orgId,
      email: dto.email,
      role: dto.role ?? 'member',
      token,
      invitedBy,
      expiresAt,
    }));
  }

  async accept(token: string, userId: string): Promise<void> {
    const inv = await this.repo.findOne({ where: { token } });
    if (!inv) throw new NotFoundError('Invitation');
    if (inv.status !== 'pending') throw new UnprocessableError('Invitation is no longer valid');
    if (new Date() > inv.expiresAt) {
      inv.status = 'expired';
      await this.repo.save(inv);
      throw new UnprocessableError('Invitation has expired');
    }

    inv.status = 'accepted';
    inv.acceptedAt = new Date();
    await this.repo.save(inv);

    await AppDataSource.query(
      `INSERT INTO organization_members (id, organization_id, user_id, role, invited_by, invited_at, joined_at, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), true, NOW(), NOW())
       ON CONFLICT (organization_id, user_id) DO UPDATE SET is_active = true, role = $3`,
      [inv.organizationId, userId, inv.role, inv.invitedBy, inv.createdAt],
    );
  }

  async revoke(id: string, orgId: string): Promise<void> {
    const inv = await this.repo.findOne({ where: { id, organizationId: orgId } });
    if (!inv) throw new NotFoundError('Invitation');
    inv.status = 'revoked';
    await this.repo.save(inv);
  }

  async getByToken(token: string): Promise<Invitation> {
    const inv = await this.repo.findOne({ where: { token } });
    if (!inv) throw new NotFoundError('Invitation');
    return inv;
  }
}
