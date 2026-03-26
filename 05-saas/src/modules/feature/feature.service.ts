import { AppDataSource } from '../../config/database.config';
import { Feature } from './entities/feature.entity';
import { OrganizationFeature } from './entities/organization-feature.entity';
import { CreateFeatureDto, UpdateFeatureDto, SetOrgFeatureDto, FeatureQueryDto } from './dto/feature.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class FeatureService {
  private repo = AppDataSource.getRepository(Feature);
  private orgFeatureRepo = AppDataSource.getRepository(OrganizationFeature);

  async findAll(query: FeatureQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repo.createQueryBuilder('f').orderBy('f.key', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('f.key ILIKE :s OR f.name ILIKE :s', { s: `%${search}%` });
    const [features, total] = await qb.getManyAndCount();
    return { features, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Feature> {
    const f = await this.repo.findOne({ where: { id } });
    if (!f) throw new NotFoundError('Feature');
    return f;
  }

  async create(dto: CreateFeatureDto): Promise<Feature> {
    const existing = await this.repo.findOne({ where: { key: dto.key } });
    if (existing) throw new ConflictError(`Feature key '${dto.key}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateFeatureDto): Promise<Feature> {
    const f = await this.findById(id);
    Object.assign(f, dto);
    return this.repo.save(f);
  }

  async delete(id: string): Promise<void> {
    const f = await this.findById(id);
    await this.repo.remove(f);
  }

  async getOrgFeatures(orgId: string) {
    return AppDataSource.query(
      `SELECT f.*, COALESCE(of.is_enabled, f.is_enabled) as effective_enabled, of.enabled_at
       FROM features f
       LEFT JOIN organization_features of ON of.feature_id = f.id AND of.organization_id = $1
       ORDER BY f.key ASC`,
      [orgId],
    );
  }

  async setOrgFeature(orgId: string, dto: SetOrgFeatureDto): Promise<OrganizationFeature> {
    const existing = await this.orgFeatureRepo.findOne({
      where: { organizationId: orgId, featureId: dto.featureId },
    });

    if (existing) {
      existing.isEnabled = dto.isEnabled;
      if (dto.isEnabled) existing.enabledAt = new Date();
      return this.orgFeatureRepo.save(existing);
    }

    return this.orgFeatureRepo.save(this.orgFeatureRepo.create({
      organizationId: orgId,
      featureId: dto.featureId,
      isEnabled: dto.isEnabled,
      enabledAt: dto.isEnabled ? new Date() : undefined,
    }));
  }
}
