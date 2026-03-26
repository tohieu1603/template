import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BlogTag } from './blog-tag.entity';

@Entity('blog_posts')
export class BlogPost extends BaseEntity {
  @Column({ name: 'profile_id', type: 'uuid', nullable: true })
  @Index()
  profileId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  excerpt: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @Column({ default: 'draft' })
  status: string;  // 'draft' | 'published' | 'archived'

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({ name: 'reading_time', type: 'int', nullable: true })
  readingTime: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, type: 'text' })
  metaDescription: string;

  @ManyToMany(() => BlogTag, { eager: false })
  @JoinTable({
    name: 'blog_post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: BlogTag[];
}
