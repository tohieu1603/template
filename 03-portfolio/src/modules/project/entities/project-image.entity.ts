import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('project_images')
export class ProjectImage extends BaseEntity {
  @Column({ name: 'project_id', type: 'uuid' })
  @Index()
  projectId: string;

  @Column()
  url: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'alt_text', nullable: true })
  altText: string;

  @Column({ nullable: true })
  caption: string;

  @Column({ default: 'image' })
  type: string;  // 'image' | 'video' | 'embed'

  @Column({ name: 'embed_url', nullable: true })
  embedUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_cover', default: false })
  isCover: boolean;
}
