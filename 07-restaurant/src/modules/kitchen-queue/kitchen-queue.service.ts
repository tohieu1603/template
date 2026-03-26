import { AppDataSource } from '../../config/database.config';
import { KitchenQueue } from './entities/kitchen-queue.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { UpdateKitchenQueueDto, KitchenQueueQueryDto } from './dto/kitchen-queue.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class KitchenQueueService {
  private repo = AppDataSource.getRepository(KitchenQueue);
  private orderItemRepo = AppDataSource.getRepository(OrderItem);

  async findAll(query: KitchenQueueQueryDto) {
    const { page = 1, limit = 50, station } = query;
    const qb = this.repo.createQueryBuilder('k').orderBy('k.priority', 'DESC').addOrderBy('k.createdAt', 'ASC').limit(limit).offset((page - 1) * limit);
    if (station) qb.where('k.station = :station', { station });
    if (query.status === 'pending') qb.andWhere('k.startedAt IS NULL AND k.completedAt IS NULL');
    else if (query.status === 'in_progress') qb.andWhere('k.startedAt IS NOT NULL AND k.completedAt IS NULL');
    else if (query.status === 'completed') qb.andWhere('k.completedAt IS NOT NULL');
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<KitchenQueue> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Kitchen queue item');
    return item;
  }

  async update(id: string, dto: UpdateKitchenQueueDto): Promise<KitchenQueue> {
    const item = await this.findById(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async start(id: string): Promise<KitchenQueue> {
    const item = await this.findById(id);
    item.startedAt = new Date();
    await this.orderItemRepo.update({ id: item.orderItemId }, { status: 'preparing' });
    return this.repo.save(item);
  }

  async complete(id: string): Promise<KitchenQueue> {
    const item = await this.findById(id);
    item.completedAt = new Date();
    await this.orderItemRepo.update({ id: item.orderItemId }, { status: 'ready' });
    return this.repo.save(item);
  }
}
