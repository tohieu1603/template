import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('webhooks')
export class Webhook extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column()
  url: string;

  @Column({ type: 'text', array: true })
  events: string[];

  @Column()
  secret: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_triggered_at', type: 'timestamptz', nullable: true })
  lastTriggeredAt: Date;

  @Column({ name: 'failure_count', default: 0 })
  failureCount: number;
}
