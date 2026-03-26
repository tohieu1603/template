import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('plans')
export class Plan extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'price_monthly', type: 'decimal', precision: 15, scale: 2, default: 0 })
  priceMonthly: number;

  @Column({ name: 'price_yearly', type: 'decimal', precision: 15, scale: 2, default: 0 })
  priceYearly: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'trial_days', default: 0 })
  trialDays: number;

  @Column({ name: 'is_popular', default: false })
  isPopular: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
