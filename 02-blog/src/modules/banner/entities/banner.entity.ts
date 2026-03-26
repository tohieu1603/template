import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('banners')
export class Banner extends BaseEntity {
  @Column({ name: 'post_id', type: 'uuid', nullable: true, unique: true })
  @Index()
  postId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @Column()
  title: string;

  @Column({ nullable: true, length: 300 })
  subtitle: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'link_url', length: 500 })
  linkUrl: string;

  @Column({ length: 20, default: 'hero' })
  position: string;

  @Column({ type: 'smallint', default: 0 })
  rank: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ default: 'active', length: 20 })
  status: string;

  @Column({ name: 'is_auto_assigned', default: true })
  isAutoAssigned: boolean;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'click_count', default: 0 })
  clickCount: number;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date;
}
