import { AppDataSource } from '../../config/database.config';
import { Payment } from './entities/payment.entity';
import { Booking } from '../booking/entities/booking.entity';
import { CreatePaymentDto, RefundPaymentDto, PaymentQueryDto } from './dto/payment.dto';
import { NotFoundError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class PaymentService {
  private repo = AppDataSource.getRepository(Payment);
  private bookingRepo = AppDataSource.getRepository(Booking);

  async findAll(query: PaymentQueryDto) {
    const { page = 1, limit = 20, bookingId, status, method } = query;
    const qb = this.repo.createQueryBuilder('p')
      .orderBy('p.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (bookingId) qb.where('p.bookingId = :bookingId', { bookingId });
    if (status) qb.andWhere('p.status = :status', { status });
    if (method) qb.andWhere('p.method = :method', { method });

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Payment> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Payment');
    return item;
  }

  async findByBooking(bookingId: string): Promise<Payment[]> {
    return this.repo.find({ where: { bookingId }, order: { createdAt: 'DESC' } });
  }

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const booking = await this.bookingRepo.findOne({ where: { id: dto.bookingId } });
    if (!booking) throw new NotFoundError('Booking');

    const payment = this.repo.create({
      ...dto,
      status: 'pending',
    });
    return this.repo.save(payment);
  }

  async markAsPaid(id: string): Promise<Payment> {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'pending') throw new UnprocessableError('Payment is not in pending status');
    payment.status = 'paid';
    payment.paidAt = new Date();
    return this.repo.save(payment);
  }

  async refund(id: string, dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'paid') throw new UnprocessableError('Can only refund paid payments');

    payment.status = 'refunded';
    payment.refundAmount = dto.refundAmount;
    payment.refundedAt = new Date();
    return this.repo.save(payment);
  }
}
