import { AppDataSource } from '../../config/database.config';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { ShippingMethod } from '../shipping-method/entities/shipping-method.entity';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { NotFoundError, ValidationError, ForbiddenError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

/**
 * Order service: handles order creation, status updates, and history.
 * Uses transactions to ensure data consistency.
 */
export class OrderService {
  private orderRepo = AppDataSource.getRepository(Order);
  private itemRepo = AppDataSource.getRepository(OrderItem);
  private historyRepo = AppDataSource.getRepository(OrderStatusHistory);
  private variantRepo = AppDataSource.getRepository(ProductVariant);
  private couponRepo = AppDataSource.getRepository(Coupon);
  private shippingRepo = AppDataSource.getRepository(ShippingMethod);

  async findAll(query: OrderQueryDto, userId?: string, isAdmin = false) {
    const { page = 1, limit = 10, search, status, paymentStatus } = query;
    const offset = (page - 1) * limit;

    const qb = this.orderRepo.createQueryBuilder('o')
      .orderBy('o.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (!isAdmin && userId) {
      qb.where('o.userId = :userId', { userId });
    } else if (query.userId) {
      qb.where('o.userId = :userId', { userId: query.userId });
    }

    if (status) qb.andWhere('o.status = :status', { status });
    if (paymentStatus) qb.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus });
    if (search) qb.andWhere('o.orderNumber ILIKE :s', { s: `%${search}%` });

    const [orders, total] = await qb.getManyAndCount();
    return { orders, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string, userId?: string, isAdmin = false) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundError('Order');
    if (!isAdmin && order.userId !== userId) throw new ForbiddenError('Access denied');

    const [items, history] = await Promise.all([
      this.itemRepo.find({ where: { orderId: id } }),
      this.historyRepo.find({ where: { orderId: id }, order: { createdAt: 'ASC' } }),
    ]);

    return { ...order, items, statusHistory: history };
  }

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    return AppDataSource.transaction(async (manager) => {
      // Validate and compute items
      let subtotal = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of dto.items) {
        const variant = await manager.findOne(ProductVariant, {
          where: { id: item.variantId, isActive: true },
        });
        if (!variant) throw new NotFoundError(`Variant ${item.variantId}`);
        if (variant.stockQuantity < item.quantity) {
          throw new ValidationError(`Insufficient stock for SKU ${variant.sku}`);
        }

        // Get product info for snapshot
        const product = await manager.query(
          `SELECT p.name FROM products p WHERE p.id = $1`,
          [variant.productId],
        );

        const itemSubtotal = Number(variant.price) * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          variantId: item.variantId,
          productId: variant.productId,
          productName: product[0]?.name ?? 'Unknown',
          sku: variant.sku,
          price: Number(variant.price),
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });

        // Deduct stock
        await manager.decrement(ProductVariant, { id: item.variantId }, 'stockQuantity', item.quantity);
      }

      // Apply coupon
      let discountAmount = 0;
      if (dto.couponCode) {
        const coupon = await manager.findOne(Coupon, { where: { code: dto.couponCode, isActive: true } });
        if (coupon) {
          discountAmount = this.calculateDiscount(coupon, subtotal);
          await manager.increment(Coupon, { id: coupon.id }, 'usedCount', 1);
        }
      }

      // Get shipping fee
      let shippingFee = 0;
      if (dto.shippingMethodId) {
        const method = await manager.findOne(ShippingMethod, { where: { id: dto.shippingMethodId } });
        if (method) {
          shippingFee = method.freeShipThreshold && subtotal >= method.freeShipThreshold
            ? 0 : Number(method.baseFee);
        }
      }

      const total = subtotal - discountAmount + shippingFee;
      const orderNumber = this.generateOrderNumber();

      const order = await manager.save(Order, manager.create(Order, {
        userId,
        orderNumber,
        subtotal,
        discountAmount,
        shippingFee,
        total,
        shippingName: dto.shippingName,
        shippingPhone: dto.shippingPhone,
        shippingAddress: dto.shippingAddress,
        paymentMethod: dto.paymentMethod,
        note: dto.note,
      }));

      // Save order items
      for (const item of orderItems) {
        await manager.save(OrderItem, manager.create(OrderItem, { ...item, orderId: order.id }));
      }

      // Create status history
      await manager.save(OrderStatusHistory, manager.create(OrderStatusHistory, {
        orderId: order.id,
        toStatus: 'pending',
        note: 'Order placed',
        changedBy: userId,
      }));

      return order;
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, changedBy: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundError('Order');

    const fromStatus = order.status;
    order.status = dto.status as any;

    if (dto.status === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancelReason = dto.cancelReason ?? '';
      // Restore stock on cancellation
      await this.restoreStock(id);
    }
    if (dto.status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await this.orderRepo.save(order);

    // Record status change in history
    await this.historyRepo.save(this.historyRepo.create({
      orderId: id,
      fromStatus,
      toStatus: dto.status,
      note: dto.note,
      changedBy,
    }));

    return order;
  }

  async cancelOrder(id: string, userId: string, reason?: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundError('Order');
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new ValidationError('Order cannot be cancelled at this stage');
    }

    return this.updateStatus(id, { status: 'cancelled', cancelReason: reason }, userId);
  }

  private calculateDiscount(coupon: Coupon, subtotal: number): number {
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) return 0;

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscountAmount) discount = Math.min(discount, Number(coupon.maxDiscountAmount));
    } else if (coupon.type === 'fixed') {
      discount = Number(coupon.value);
    }

    return Math.min(discount, subtotal);
  }

  private async restoreStock(orderId: string): Promise<void> {
    const items = await this.itemRepo.find({ where: { orderId } });
    for (const item of items) {
      if (item.variantId) {
        await this.variantRepo.increment({ id: item.variantId }, 'stockQuantity', item.quantity);
      }
    }
  }

  private generateOrderNumber(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${ts}-${rand}`;
  }
}
