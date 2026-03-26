import { AppDataSource } from '../../config/database.config';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { KitchenQueue } from '../kitchen-queue/entities/kitchen-queue.entity';
import { MenuItem } from '../menu-item/entities/menu-item.entity';
import { CreateOrderDto, CancelOrderDto, OrderQueryDto } from './dto/order.dto';
import { NotFoundError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class OrderService {
  private orderRepo = AppDataSource.getRepository(Order);
  private itemRepo = AppDataSource.getRepository(OrderItem);
  private historyRepo = AppDataSource.getRepository(OrderStatusHistory);
  private menuItemRepo = AppDataSource.getRepository(MenuItem);
  private kitchenRepo = AppDataSource.getRepository(KitchenQueue);

  async findAll(query: OrderQueryDto) {
    const { page = 1, limit = 10, search, status, type, tableId, customerId, date } = query;
    const qb = this.orderRepo.createQueryBuilder('o').orderBy('o.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('o.orderNumber ILIKE :s', { s: `%${search}%` });
    if (status) qb.andWhere('o.status = :status', { status });
    if (type) qb.andWhere('o.type = :type', { type });
    if (tableId) qb.andWhere('o.tableId = :tableId', { tableId });
    if (customerId) qb.andWhere('o.customerId = :customerId', { customerId });
    if (date) qb.andWhere('DATE(o.createdAt) = :date', { date });
    const [orders, total] = await qb.getManyAndCount();
    return { orders, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundError('Order');
    const items = await this.itemRepo.find({ where: { orderId: id }, order: { createdAt: 'ASC' } });
    return { ...order, items };
  }

  async create(dto: CreateOrderDto, userId?: string): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();

    let subtotal = 0;
    const itemsData: Partial<OrderItem>[] = [];

    for (const itemDto of dto.items) {
      const menuItem = await this.menuItemRepo.findOne({ where: { id: itemDto.menuItemId } });
      if (!menuItem) throw new NotFoundError(`Menu item ${itemDto.menuItemId}`);

      let itemPrice = Number(menuItem.price);
      if (itemDto.options) {
        for (const opt of itemDto.options) {
          itemPrice += Number(opt.priceModifier || 0);
        }
      }
      const itemSubtotal = itemPrice * itemDto.quantity;
      subtotal += itemSubtotal;

      itemsData.push({
        menuItemId: itemDto.menuItemId,
        itemName: menuItem.name,
        itemPrice,
        quantity: itemDto.quantity,
        subtotal: itemSubtotal,
        options: itemDto.options || [],
        specialInstructions: itemDto.specialInstructions,
        status: 'pending',
      });
    }

    const total = subtotal;
    const order = this.orderRepo.create({
      orderNumber,
      customerId: dto.customerId || userId,
      tableId: dto.tableId,
      type: dto.type,
      status: 'pending',
      subtotal,
      total,
      note: dto.note,
      deliveryAddress: dto.deliveryAddress,
      deliveryPhone: dto.deliveryPhone,
      paymentMethod: dto.paymentMethod || 'cash',
      paymentStatus: 'pending',
      couponId: dto.couponId,
    });

    const savedOrder = await this.orderRepo.save(order);

    const savedItems = await Promise.all(
      itemsData.map(item => this.itemRepo.save(this.itemRepo.create({ ...item, orderId: savedOrder.id }))),
    );

    // Add items to kitchen queue
    for (const item of savedItems) {
      await this.kitchenRepo.save(this.kitchenRepo.create({ orderItemId: item.id }));
    }

    await this.addHistory(savedOrder.id, null, 'pending', 'Order created', userId);

    return savedOrder;
  }

  async confirm(id: string, userId?: string): Promise<Order> {
    return this.changeStatus(id, 'confirmed', userId, 'Order confirmed');
  }

  async prepare(id: string, userId?: string): Promise<Order> {
    return this.changeStatus(id, 'preparing', userId, 'Order being prepared');
  }

  async ready(id: string, userId?: string): Promise<Order> {
    return this.changeStatus(id, 'ready', userId, 'Order ready');
  }

  async serve(id: string, userId?: string): Promise<Order> {
    return this.changeStatus(id, 'served', userId, 'Order served');
  }

  async complete(id: string, userId?: string): Promise<Order> {
    return this.changeStatus(id, 'completed', userId, 'Order completed');
  }

  async cancel(id: string, dto: CancelOrderDto, userId?: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundError('Order');
    if (['completed', 'cancelled'].includes(order.status)) throw new UnprocessableError('Cannot cancel this order');
    const fromStatus = order.status;
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = dto.reason || null;
    await this.orderRepo.save(order);
    await this.addHistory(id, fromStatus, 'cancelled', dto.reason, userId);
    return order;
  }

  async getHistory(id: string) {
    await this.findById(id);
    return this.historyRepo.find({ where: { orderId: id }, order: { createdAt: 'ASC' } });
  }

  private async changeStatus(id: string, toStatus: string, userId?: string, note?: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundError('Order');
    const fromStatus = order.status;
    order.status = toStatus;
    await this.orderRepo.save(order);
    await this.addHistory(id, fromStatus, toStatus, note, userId);
    return order;
  }

  private async addHistory(orderId: string, fromStatus: string | null, toStatus: string, note?: string, changedBy?: string) {
    await this.historyRepo.save(this.historyRepo.create({ orderId, fromStatus, toStatus, note, changedBy }));
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await this.orderRepo.count();
    return `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
}
