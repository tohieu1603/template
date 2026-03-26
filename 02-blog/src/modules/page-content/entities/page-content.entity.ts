import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('page_contents')
export class PageContent extends BaseEntity {
  @Column({ name: 'page_slug', unique: true })
  pageSlug: string;

  @Column({ name: 'page_name' })
  pageName: string;

  @Column({ type: 'jsonb' })
  content: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
