import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type ProductStatus = 'draft' | 'active' | 'archived';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ name: 'category_id', type: 'uuid' })
  @Index()
  categoryId: string;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  @Index()
  brandId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'short_description', nullable: true, type: 'text' })
  shortDescription: string;

  @Column({ name: 'base_price', type: 'decimal', precision: 15, scale: 2 })
  basePrice: number;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'enum', enum: ['draft', 'active', 'archived'], default: 'draft' })
  status: ProductStatus;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, type: 'text' })
  metaDescription: string;

  // Populated via joins
  category?: any;
  brand?: any;
  variants?: any[];
}
