import { AppDataSource } from '../../config/database.config';
import { Plan } from './entities/plan.entity';
import { PlanFeature } from './entities/plan-feature.entity';
import { CreatePlanDto, UpdatePlanDto, PlanQueryDto } from './dto/plan.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class PlanService {
  private repo = AppDataSource.getRepository(Plan);
  private featureRepo = AppDataSource.getRepository(PlanFeature);

  async findAll(query: PlanQueryDto) {
    const { page = 1, limit = 10, isActive } = query;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (isActive !== undefined) qb.where('p.isActive = :isActive', { isActive: isActive === 'true' });
    const [plans, total] = await qb.getManyAndCount();
    const plansWithFeatures = await Promise.all(plans.map(async p => {
      const features = await this.featureRepo.find({ where: { planId: p.id }, order: { sortOrder: 'ASC' } });
      return { ...p, features };
    }));
    return { plans: plansWithFeatures, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Plan & { features: PlanFeature[] }> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundError('Plan');
    const features = await this.featureRepo.find({ where: { planId: id }, order: { sortOrder: 'ASC' } });
    return Object.assign(plan, { features });
  }

  async create(dto: CreatePlanDto): Promise<Plan> {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Plan slug '${slug}' already exists`);

    const { features: _features, ...planData } = dto;
    const plan = await this.repo.save(this.repo.create({ ...planData, slug }));

    if (dto.features?.length) {
      for (const f of dto.features) {
        await this.featureRepo.save(this.featureRepo.create({ ...f, planId: plan.id }));
      }
    }

    return plan;
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundError('Plan');
    Object.assign(plan, dto);
    return this.repo.save(plan);
  }

  async delete(id: string): Promise<void> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundError('Plan');
    await this.featureRepo.delete({ planId: id });
    await this.repo.remove(plan);
  }

  async addFeature(planId: string, featureData: Partial<PlanFeature>): Promise<PlanFeature> {
    const plan = await this.repo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundError('Plan');
    const feature = this.featureRepo.create({ ...featureData, planId } as PlanFeature);
    return this.featureRepo.save(feature);
  }

  async removeFeature(featureId: string): Promise<void> {
    await this.featureRepo.delete(featureId);
  }
}
