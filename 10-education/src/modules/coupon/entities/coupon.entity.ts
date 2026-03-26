import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ default: 'percent' })
  type: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @Column({ name: 'min_course_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minCoursePrice: number;

  @Column({ name: 'max_discount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxDiscount: number;

  @Column({ name: 'usage_limit', nullable: true })
  usageLimit: number;

  @Column({ name: 'used_count', default: 0 })
  usedCount: number;

  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
