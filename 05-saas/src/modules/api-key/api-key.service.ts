import crypto from 'crypto';
import { AppDataSource } from '../../config/database.config';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto, ApiKeyQueryDto } from './dto/api-key.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ApiKeyService {
  private repo = AppDataSource.getRepository(ApiKey);

  async findAll(orgId: string, query: ApiKeyQueryDto) {
    const { page = 1, limit = 10, isActive } = query;
    const qb = this.repo.createQueryBuilder('k')
      .where('k.organizationId = :orgId', { orgId })
      .select(['k.id', 'k.name', 'k.keyPrefix', 'k.scopes', 'k.lastUsedAt', 'k.expiresAt', 'k.isActive', 'k.createdAt'])
      .orderBy('k.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    if (isActive !== undefined) qb.andWhere('k.isActive = :isActive', { isActive: isActive === 'true' });
    const [keys, total] = await qb.getManyAndCount();
    return { keys, meta: buildPaginationMeta(page, limit, total) };
  }

  async create(orgId: string, dto: CreateApiKeyDto, userId: string): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 8);

    const apiKey = await this.repo.save(this.repo.create({
      organizationId: orgId,
      name: dto.name,
      keyHash,
      keyPrefix,
      scopes: dto.scopes ?? [],
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      createdBy: userId,
    }));

    return { apiKey, rawKey };
  }

  async revoke(id: string, orgId: string): Promise<void> {
    const key = await this.repo.findOne({ where: { id, organizationId: orgId } });
    if (!key) throw new NotFoundError('API key');
    key.isActive = false;
    await this.repo.save(key);
  }

  async rotate(id: string, orgId: string): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const key = await this.repo.findOne({ where: { id, organizationId: orgId } });
    if (!key) throw new NotFoundError('API key');

    const rawKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
    key.keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    key.keyPrefix = rawKey.substring(0, 8);
    key.isActive = true;

    const saved = await this.repo.save(key);
    return { apiKey: saved, rawKey };
  }
}
