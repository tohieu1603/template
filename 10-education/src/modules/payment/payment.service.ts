import { AppDataSource } from '../../config/database.config';
import { Payment } from './entities/payment.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Course } from '../course/entities/course.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { CreatePaymentDto, UpdatePaymentStatusDto, PaymentQueryDto } from './dto/payment.dto';
import { NotFoundError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class PaymentService {
  private repo = AppDataSource.getRepository(Payment);
  private enrollmentRepo = AppDataSource.getRepository(Enrollment);
  private courseRepo = AppDataSource.getRepository(Course);
  private couponRepo = AppDataSource.getRepository(Coupon);

  async findAll(query: PaymentQueryDto) {
    const { page = 1, limit = 10, status, studentId, courseId } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC').limit(limit).offset(offset);
    if (status) qb.where('p.status = :status', { status });
    if (studentId) qb.andWhere('p.studentId = :studentId', { studentId });
    if (courseId) qb.andWhere('p.courseId = :courseId', { courseId });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundError('Payment');
    return payment;
  }

  async findMyPayments(studentId: string, query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    const [items, total] = await this.repo.createQueryBuilder('p')
      .where('p.studentId = :studentId', { studentId })
      .orderBy('p.createdAt', 'DESC')
      .limit(limit).offset(offset)
      .getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async create(_requesterId: string, dto: CreatePaymentDto) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: dto.enrollmentId } });
    if (!enrollment) throw new NotFoundError('Enrollment');
    const studentId = enrollment.studentId;

    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundError('Course');

    let discountAmount = 0;
    let couponId: string | undefined;

    if (dto.couponCode) {
      const coupon = await this.couponRepo.findOne({ where: { code: dto.couponCode, isActive: true } });
      if (coupon) {
        couponId = coupon.id;
        if (coupon.type === 'percent') {
          discountAmount = (Number(course.price) * Number(coupon.value)) / 100;
          if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
        } else {
          discountAmount = Number(coupon.value);
        }
      }
    }

    const total = Math.max(0, Number(course.price) - discountAmount);

    const payment = this.repo.create({
      enrollmentId: dto.enrollmentId,
      studentId,
      courseId: dto.courseId,
      amount: course.price,
      discountAmount,
      total,
      method: dto.method,
      couponId,
      status: 'pending',
    });

    return this.repo.save(payment);
  }

  async updateStatus(id: string, dto: UpdatePaymentStatusDto) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundError('Payment');
    payment.status = dto.status;
    if (dto.gatewayTransactionId) payment.gatewayTransactionId = dto.gatewayTransactionId;
    if (dto.status === 'paid') payment.paidAt = new Date();
    return this.repo.save(payment);
  }
}
