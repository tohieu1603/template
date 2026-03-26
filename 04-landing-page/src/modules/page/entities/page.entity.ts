import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('pages')
export class Page extends BaseEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: 'draft' })
  status: string; // draft | published | archived

  @Column({ name: 'is_homepage', default: false })
  isHomepage: boolean;

  @Column({ default: 'default' })
  template: string; // default | hero | product | webinar | coming_soon

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, type: 'text' })
  metaDescription: string;

  @Column({ name: 'og_image', nullable: true })
  ogImage: string;

  @Column({ name: 'canonical_url', nullable: true })
  canonicalUrl: string;

  @Column({ name: 'custom_css', type: 'text', nullable: true })
  customCss: string;

  @Column({ name: 'custom_js', type: 'text', nullable: true })
  customJs: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;
}
