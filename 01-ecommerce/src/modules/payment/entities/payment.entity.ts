import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  @Index()
  orderId: string;

  @Column()
  method: string;

  @Column({ name: 'gateway_transaction_id', type: 'uuid', nullable: true })
  gatewayTransactionId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, any>;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date;

  @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
  refundedAt: Date;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  refundAmount: number;

  @Column({ name: 'refund_reason', nullable: true, type: 'text' })
  refundReason: string;
}
