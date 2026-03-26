import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  @Index()
  productId: string;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ name: 'compare_at_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  costPrice: number;

  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({ name: 'low_stock_threshold', default: 5 })
  lowStockThreshold: number;

  @Column({ name: 'weight_gram', nullable: true })
  weightGram: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Populated via joins
  images?: any[];
  attributeValues?: any[];
}
