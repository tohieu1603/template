import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total: number;

  @Column()
  method: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
  couponId: string;

  @Column({ name: 'gateway_transaction_id', nullable: true })
  gatewayTransactionId: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date;
}
