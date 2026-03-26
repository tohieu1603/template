import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('page_sections')
export class PageSection extends BaseEntity {
  @Column({ name: 'page_id', type: 'uuid' })
  pageId: string;

  @Column({ name: 'section_type' })
  sectionType: string; // hero | features | pricing | testimonials | faq | cta | gallery | stats | team | contact_form | custom

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'jsonb', nullable: true })
  content: Record<string, any>;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'background_color', nullable: true })
  backgroundColor: string;

  @Column({ name: 'background_image', nullable: true })
  backgroundImage: string;

  @Column({ name: 'css_class', nullable: true })
  cssClass: string;
}
