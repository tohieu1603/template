import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'subscription_id', type: 'uuid', nullable: true })
  subscriptionId: string;

  @Column({ name: 'invoice_number', unique: true })
  invoiceNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'billing_name', nullable: true })
  billingName: string;

  @Column({ name: 'billing_email', nullable: true })
  billingEmail: string;

  @Column({ name: 'billing_address', nullable: true, type: 'text' })
  billingAddress: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column({ name: 'external_id', nullable: true })
  externalId: string;

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl: string;
}
