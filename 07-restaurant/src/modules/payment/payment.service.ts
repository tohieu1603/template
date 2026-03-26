import { AppDataSource } from '../../config/database.config';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { ProcessPaymentDto, RefundPaymentDto, PaymentQueryDto } from './dto/payment.dto';
import { NotFoundError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class PaymentService {
  private repo = AppDataSource.getRepository(Payment);
  private orderRepo = AppDataSource.getRepository(Order);

  async findAll(query: PaymentQueryDto) {
    const { page = 1, limit = 10, status, orderId } = query;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (status) qb.where('p.status = :status', { status });
    if (orderId) qb.andWhere('p.orderId = :orderId', { orderId });
    const [payments, total] = await qb.getManyAndCount();
    return { payments, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Payment> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundError('Payment');
    return p;
  }

  async process(dto: ProcessPaymentDto): Promise<Payment> {
    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundError('Order');
    const payment = this.repo.create({ orderId: dto.orderId, method: dto.method, amount: dto.amount, status: 'paid', gatewayTransactionId: dto.gatewayTransactionId, paidAt: new Date() });
    const saved = await this.repo.save(payment);
    await this.orderRepo.update(dto.orderId, { paymentStatus: 'paid', paidAt: new Date() });
    return saved;
  }

  async markPaid(id: string): Promise<Payment> {
    const payment = await this.findById(id);
    payment.status = 'paid';
    payment.paidAt = new Date();
    const saved = await this.repo.save(payment);
    await this.orderRepo.update(payment.orderId, { paymentStatus: 'paid', paidAt: new Date() });
    return saved;
  }

  async refund(id: string, dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.findById(id);
    if (payment.status !== 'paid') throw new UnprocessableError('Payment is not in paid status');
    payment.status = 'refunded';
    payment.refundAmount = dto.refundAmount;
    const saved = await this.repo.save(payment);
    await this.orderRepo.update(payment.orderId, { paymentStatus: 'refunded' });
    return saved;
  }
}
