import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column({ name: 'profile_id', type: 'uuid', nullable: true })
  @Index()
  profileId: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ name: 'price_type', default: 'contact' })
  priceType: string;  // 'fixed' | 'hourly' | 'project' | 'contact'

  @Column({ name: 'price_from', type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceFrom: number;

  @Column({ name: 'price_to', type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceTo: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
