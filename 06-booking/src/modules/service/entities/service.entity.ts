import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'buffer_minutes', type: 'int', default: 0 })
  bufferMinutes: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ name: 'compare_at_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ name: 'max_capacity', type: 'int', default: 1 })
  maxCapacity: number;

  @Column({ name: 'requires_deposit', default: false })
  requiresDeposit: boolean;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  depositAmount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, type: 'text' })
  metaDescription: string;
}
