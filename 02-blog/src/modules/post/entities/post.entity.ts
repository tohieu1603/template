import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('posts')
export class Post extends BaseEntity {
  @Column({ name: 'author_id', type: 'uuid' })
  @Index()
  authorId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  @Index()
  categoryId: string;

  @Column({ name: 'series_id', type: 'uuid', nullable: true })
  @Index()
  seriesId: string;

  @Column({ name: 'series_order', type: 'smallint', nullable: true })
  seriesOrder: number;

  @Column({ length: 500 })
  title: string;

  @Column({ nullable: true, length: 500 })
  subtitle: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  excerpt: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'content_blocks', type: 'jsonb', nullable: true })
  contentBlocks: any;

  @Column({ name: 'content_structure', type: 'jsonb', nullable: true })
  contentStructure: any;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ default: 'draft' })
  @Index()
  status: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'allow_comments', default: true })
  allowComments: boolean;

  @Column({ name: 'reading_time', type: 'smallint', nullable: true })
  readingTime: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'share_count', default: 0 })
  shareCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @Column({ name: 'is_trending', default: false })
  @Index()
  isTrending: boolean;

  @Column({ name: 'trending_rank', type: 'smallint', nullable: true })
  trendingRank: number;

  @Column({ name: 'trending_at', type: 'timestamptz', nullable: true })
  trendingAt: Date;

  @Column({ name: 'is_evergreen', default: false })
  isEvergreen: boolean;

  @Column({ nullable: true })
  template: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: any;

  @Column({ type: 'jsonb', nullable: true })
  faq: any[];

  // SEO fields
  @Column({ name: 'meta_title', nullable: true, length: 70 })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, length: 160 })
  metaDescription: string;

  @Column({ name: 'meta_keywords', nullable: true, length: 500 })
  metaKeywords: string;

  @Column({ name: 'canonical_url', nullable: true, length: 500 })
  canonicalUrl: string;

  @Column({ name: 'og_title', nullable: true, length: 200 })
  ogTitle: string;

  @Column({ name: 'og_description', nullable: true, length: 300 })
  ogDescription: string;

  @Column({ name: 'og_image', nullable: true })
  ogImage: string;

  @Column({ name: 'twitter_title', nullable: true, length: 200 })
  twitterTitle: string;

  @Column({ name: 'twitter_description', nullable: true, length: 300 })
  twitterDescription: string;

  @Column({ name: 'twitter_image', nullable: true })
  twitterImage: string;

  @Column({ nullable: true, length: 100 })
  robots: string;

  @Column({ name: 'news_keywords', nullable: true, length: 500 })
  newsKeywords: string;
}
