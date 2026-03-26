import { AppDataSource } from '../../config/database.config';
import { OrderItem } from '../order/entities/order-item.entity';
import { UpdateOrderItemStatusDto } from './dto/order-item.dto';
import { NotFoundError } from '../../common/errors/app-error';

export class OrderItemService {
  private repo = AppDataSource.getRepository(OrderItem);

  async findById(id: string): Promise<OrderItem> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Order item');
    return item;
  }

  async updateStatus(id: string, dto: UpdateOrderItemStatusDto): Promise<OrderItem> {
    const item = await this.findById(id);
    item.status = dto.status;
    return this.repo.save(item);
  }
}
