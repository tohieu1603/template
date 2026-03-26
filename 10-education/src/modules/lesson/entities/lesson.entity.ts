import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('lessons')
export class Lesson extends BaseEntity {
  @Column({ name: 'section_id', type: 'uuid' })
  sectionId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ name: 'content_type', default: 'video' })
  contentType: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'video_url', nullable: true })
  videoUrl: string;

  @Column({ name: 'video_duration_seconds', nullable: true })
  videoDurationSeconds: number;

  @Column({ name: 'is_free_preview', default: false })
  isFreePreview: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
