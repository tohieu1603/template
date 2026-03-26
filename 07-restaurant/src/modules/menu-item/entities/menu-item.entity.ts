import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('menu_items')
export class MenuItem extends BaseEntity {
  @Column({ name: 'category_id', type: 'uuid' })
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

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ name: 'compare_at_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_vegetarian', default: false })
  isVegetarian: boolean;

  @Column({ name: 'is_spicy', default: false })
  isSpicy: boolean;

  @Column({ name: 'spicy_level', type: 'smallint', nullable: true })
  spicyLevel: number;

  @Column({ nullable: true })
  calories: number;

  @Column({ name: 'prep_time_minutes', nullable: true })
  prepTimeMinutes: number;

  @Column({ type: 'text', array: true, nullable: true })
  allergens: string[];

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, type: 'text' })
  metaDescription: string;
}
