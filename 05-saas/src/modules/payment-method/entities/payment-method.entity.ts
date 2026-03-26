import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('payment_methods')
export class PaymentMethod extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ default: 'card' })
  type: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ name: 'last_four', nullable: true })
  lastFour: string;

  @Column({ name: 'exp_month', nullable: true })
  expMonth: number;

  @Column({ name: 'exp_year', nullable: true })
  expYear: number;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'external_id', nullable: true })
  externalId: string;
}
