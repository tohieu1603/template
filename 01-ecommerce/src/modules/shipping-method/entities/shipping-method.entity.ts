import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('shipping_methods')
export class ShippingMethod extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'base_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  baseFee: number;

  @Column({ name: 'free_ship_threshold', type: 'decimal', precision: 15, scale: 2, nullable: true })
  freeShipThreshold: number;

  @Column({ name: 'estimated_days', nullable: true })
  estimatedDays: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;
}
