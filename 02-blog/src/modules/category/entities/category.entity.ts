import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  @Index()
  parentId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ nullable: true, length: 500 })
  path: string;

  @Column({ default: 0, type: 'smallint' })
  level: number;

  @Column({ name: 'seo_title', nullable: true, length: 70 })
  seoTitle: string;

  @Column({ name: 'seo_description', nullable: true, length: 160 })
  seoDescription: string;

  @Column({ name: 'og_image', nullable: true })
  ogImage: string;

  children?: Category[];
}
