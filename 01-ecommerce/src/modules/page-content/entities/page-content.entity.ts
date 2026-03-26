import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('page_contents')
export class PageContent extends BaseEntity {
  @Column({ name: 'page_slug', unique: true })
  pageSlug: string;

  @Column({ name: 'page_name' })
  pageName: string;

  @Column({ type: 'jsonb' })
  content: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, type: 'text' })
  metaDescription: string;
}
