import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('courses')
export class Course extends BaseEntity {
  @Column({ name: 'instructor_id', type: 'uuid' })
  instructorId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'preview_video_url', nullable: true })
  previewVideoUrl: string;

  @Column({ default: 'beginner' })
  level: string;

  @Column({ default: 'vi' })
  language: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'compare_at_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ name: 'is_free', default: false })
  isFree: boolean;

  @Column({ name: 'duration_hours', type: 'decimal', precision: 5, scale: 1, nullable: true })
  durationHours: number;

  @Column({ name: 'total_lessons', default: 0 })
  totalLessons: number;

  @Column({ name: 'total_enrollments', default: 0 })
  totalEnrollments: number;

  @Column({ name: 'rating_avg', type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingAvg: number;

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_bestseller', default: false })
  isBestseller: boolean;

  @Column({ type: 'jsonb', nullable: true })
  requirements: string[];

  @Column({ name: 'what_you_learn', type: 'jsonb', nullable: true })
  whatYouLearn: string[];

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;
}
