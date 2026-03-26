import crypto from 'crypto';
import { AppDataSource } from '../../config/database.config';
import { Webhook } from './entities/webhook.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { CreateWebhookDto, UpdateWebhookDto, WebhookQueryDto, WebhookLogQueryDto } from './dto/webhook.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class WebhookService {
  private repo = AppDataSource.getRepository(Webhook);
  private logRepo = AppDataSource.getRepository(WebhookLog);

  async findAll(orgId: string, query: WebhookQueryDto) {
    const { page = 1, limit = 10, isActive } = query;
    const qb = this.repo.createQueryBuilder('w')
      .where('w.organizationId = :orgId', { orgId })
      .orderBy('w.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    if (isActive !== undefined) qb.andWhere('w.isActive = :isActive', { isActive: isActive === 'true' });
    const [webhooks, total] = await qb.getManyAndCount();
    return { webhooks, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string, orgId: string): Promise<Webhook> {
    const w = await this.repo.findOne({ where: { id, organizationId: orgId } });
    if (!w) throw new NotFoundError('Webhook');
    return w;
  }

  async create(orgId: string, dto: CreateWebhookDto): Promise<Webhook> {
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    return this.repo.save(this.repo.create({ ...dto, organizationId: orgId, secret }));
  }

  async update(id: string, orgId: string, dto: UpdateWebhookDto): Promise<Webhook> {
    const w = await this.findById(id, orgId);
    Object.assign(w, dto);
    return this.repo.save(w);
  }

  async delete(id: string, orgId: string): Promise<void> {
    const w = await this.findById(id, orgId);
    await this.repo.remove(w);
  }

  async getLogs(webhookId: string, orgId: string, query: WebhookLogQueryDto) {
    // Verify webhook belongs to org
    await this.findById(webhookId, orgId);

    const { page = 1, limit = 20, success } = query;
    const qb = this.logRepo.createQueryBuilder('l')
      .where('l.webhookId = :webhookId', { webhookId })
      .orderBy('l.attemptedAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    if (success !== undefined) qb.andWhere('l.success = :success', { success: success === 'true' });
    const [logs, total] = await qb.getManyAndCount();
    return { logs, meta: buildPaginationMeta(page, limit, total) };
  }
}
