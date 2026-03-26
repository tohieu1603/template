import { AppDataSource } from '../../config/database.config';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { ProcessPaymentDto, RefundPaymentDto, PaymentQueryDto } from './dto/payment.dto';
import { NotFoundError, ValidationError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

/**
 * Payment processing service.
 * Handles payment recording, status updates, and refunds.
 */
export class PaymentService {
  private paymentRepo = AppDataSource.getRepository(Payment);
  private orderRepo = AppDataSource.getRepository(Order);

  async findAll(query: PaymentQueryDto) {
    const { page = 1, limit = 10, status, method } = query;

    const qb = this.paymentRepo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (status) qb.where('p.status = :status', { status });
    if (method) qb.andWhere('p.method = :method', { method });

    const [payments, total] = await qb.getManyAndCount();
    return { payments, meta: buildPaginationMeta(page, limit, total) };
  }

  async findByOrder(orderId: string) {
    return this.paymentRepo.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }

  async processPayment(dto: ProcessPaymentDto): Promise<Payment> {
    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundError('Order');

    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        orderId: dto.orderId,
        method: dto.method,
        amount: order.total,
        status: 'paid',
        gatewayTransactionId: dto.gatewayTransactionId,
        gatewayResponse: dto.gatewayResponse,
        paidAt: new Date(),
      }),
    );

    // Update order payment status
    await this.orderRepo.update(dto.orderId, {
      paymentStatus: 'paid',
      paidAt: new Date(),
    });

    return payment;
  }

  async refund(paymentId: string, dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'paid') throw new ValidationError('Only paid payments can be refunded');
    if (dto.refundAmount > Number(payment.amount)) {
      throw new ValidationError('Refund amount cannot exceed payment amount');
    }

    Object.assign(payment, {
      status: 'refunded',
      refundAmount: dto.refundAmount,
      refundReason: dto.refundReason,
      refundedAt: new Date(),
    });

    await this.paymentRepo.save(payment);
    await this.orderRepo.update(payment.orderId, { paymentStatus: 'refunded' });

    return payment;
  }
}
