import { AppDataSource } from '../../config/database.config';
import { Subscription } from './entities/subscription.entity';
import { Plan } from '../plan/entities/plan.entity';
import { CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionQueryDto } from './dto/subscription.dto';
import { NotFoundError, ConflictError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class SubscriptionService {
  private repo = AppDataSource.getRepository(Subscription);
  private planRepo = AppDataSource.getRepository(Plan);

  async findAll(query: SubscriptionQueryDto) {
    const { page = 1, limit = 10, status } = query;
    const qb = this.repo.createQueryBuilder('s').orderBy('s.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (status) qb.where('s.status = :status', { status });
    const [subs, total] = await qb.getManyAndCount();
    return { subscriptions: subs, meta: buildPaginationMeta(page, limit, total) };
  }

  async getCurrent(orgId: string): Promise<Subscription> {
    const sub = await this.repo.findOne({
      where: { organizationId: orgId },
      order: { createdAt: 'DESC' },
    });
    if (!sub) throw new NotFoundError('Subscription');
    return sub;
  }

  async create(orgId: string, dto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundError('Plan');

    const existing = await this.repo.findOne({
      where: { organizationId: orgId, status: 'active' },
    });
    if (existing) throw new ConflictError('Organization already has an active subscription');

    const now = new Date();
    const trialEnd = plan.trialDays > 0 ? new Date(now.getTime() + plan.trialDays * 86400000) : null;
    const periodEnd = new Date(now.getTime() + (dto.billingCycle === 'yearly' ? 365 : 30) * 86400000);

    const sub = this.repo.create({
      organizationId: orgId,
      planId: dto.planId,
      billingCycle: dto.billingCycle ?? 'monthly',
      status: trialEnd ? 'trialing' : 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialStart: trialEnd ? now : undefined,
      trialEnd: trialEnd ?? undefined,
    });

    return this.repo.save(sub);
  }

  async upgrade(orgId: string, dto: UpdateSubscriptionDto): Promise<Subscription> {
    const sub = await this.getCurrent(orgId);
    if (dto.planId) sub.planId = dto.planId;
    if (dto.billingCycle) sub.billingCycle = dto.billingCycle;
    return this.repo.save(sub);
  }

  async cancel(orgId: string): Promise<Subscription> {
    const sub = await this.getCurrent(orgId);
    sub.cancelAtPeriodEnd = true;
    sub.cancelledAt = new Date();
    return this.repo.save(sub);
  }
}
