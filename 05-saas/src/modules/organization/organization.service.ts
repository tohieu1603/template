import { AppDataSource } from '../../config/database.config';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationQueryDto } from './dto/organization.dto';
import { ConflictError, NotFoundError, ForbiddenError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class OrganizationService {
  private repo = AppDataSource.getRepository(Organization);

  async findAll(query: OrganizationQueryDto) {
    const { page = 1, limit = 10, search, industry, isActive } = query;
    const qb = this.repo.createQueryBuilder('o').orderBy('o.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('o.name ILIKE :s OR o.slug ILIKE :s', { s: `%${search}%` });
    if (industry) qb.andWhere('o.industry = :industry', { industry });
    if (isActive !== undefined) qb.andWhere('o.isActive = :isActive', { isActive: isActive === 'true' });
    const [orgs, total] = await qb.getManyAndCount();
    return { orgs, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Organization> {
    const org = await this.repo.findOne({ where: { id } });
    if (!org) throw new NotFoundError('Organization');
    return org;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const org = await this.repo.findOne({ where: { slug } });
    if (!org) throw new NotFoundError('Organization');
    return org;
  }

  async create(dto: CreateOrganizationDto, ownerId: string): Promise<Organization> {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Slug '${slug}' already taken`);

    const org = this.repo.create({ ...dto, slug, ownerId });
    const saved = await this.repo.save(org);

    // Add owner as owner member
    await AppDataSource.query(
      `INSERT INTO organization_members (id, organization_id, user_id, role, joined_at, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'owner', NOW(), true, NOW(), NOW())
       ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [saved.id, ownerId],
    );

    return saved;
  }

  async update(id: string, dto: UpdateOrganizationDto, userId: string): Promise<Organization> {
    const org = await this.findById(id);
    if (org.ownerId !== userId) {
      // Check if admin via roles
    }
    Object.assign(org, dto);
    return this.repo.save(org);
  }

  async delete(id: string): Promise<void> {
    const org = await this.findById(id);
    await this.repo.remove(org);
  }

  async getUserOrganizations(userId: string) {
    return AppDataSource.query(
      `SELECT o.* FROM organizations o
       JOIN organization_members m ON m.organization_id = o.id
       WHERE m.user_id = $1 AND m.is_active = true
       ORDER BY o.created_at DESC`,
      [userId],
    );
  }
}
