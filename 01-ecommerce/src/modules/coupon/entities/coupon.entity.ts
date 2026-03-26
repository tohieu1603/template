import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type CouponType = 'percent' | 'fixed' | 'free_shipping';

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: ['percent', 'fixed', 'free_shipping'] })
  type: CouponType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @Column({ name: 'min_order_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minOrderAmount: number;

  @Column({ name: 'max_discount_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxDiscountAmount: number;

  @Column({ name: 'usage_limit', nullable: true })
  usageLimit: number;

  @Column({ name: 'usage_per_user', nullable: true })
  usagePerUser: number;

  @Column({ name: 'used_count', default: 0 })
  usedCount: number;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
