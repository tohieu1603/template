import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string;

  @Column({ name: 'table_id', type: 'uuid', nullable: true })
  tableId: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ type: 'varchar', default: 'dine_in' })
  type: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
  couponId: string;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @Column({ name: 'delivery_address', nullable: true, type: 'text' })
  deliveryAddress: string;

  @Column({ name: 'delivery_phone', nullable: true })
  deliveryPhone: string;

  @Column({ name: 'payment_method', type: 'varchar', default: 'cash' })
  paymentMethod: string;

  @Column({ name: 'payment_status', type: 'varchar', default: 'pending' })
  paymentStatus: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'cancel_reason', nullable: true })
  cancelReason: string;

  @Column({ name: 'estimated_ready_at', type: 'timestamptz', nullable: true })
  estimatedReadyAt: Date;
}
