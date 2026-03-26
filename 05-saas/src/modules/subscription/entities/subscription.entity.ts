import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ default: 'trialing' })
  status: string;

  @Column({ name: 'billing_cycle', default: 'monthly' })
  billingCycle: string;

  @Column({ name: 'current_period_start', type: 'timestamptz', nullable: true })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamptz', nullable: true })
  currentPeriodEnd: Date;

  @Column({ name: 'cancel_at_period_end', default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'trial_start', type: 'timestamptz', nullable: true })
  trialStart: Date;

  @Column({ name: 'trial_end', type: 'timestamptz', nullable: true })
  trialEnd: Date;

  @Column({ name: 'external_id', nullable: true })
  externalId: string;
}
