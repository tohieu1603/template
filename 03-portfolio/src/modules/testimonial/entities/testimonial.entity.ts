import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('testimonials')
export class Testimonial extends BaseEntity {
  @Column({ name: 'profile_id', type: 'uuid', nullable: true })
  @Index()
  profileId: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string;

  @Column({ name: 'client_name' })
  clientName: string;

  @Column({ name: 'client_title', nullable: true })
  clientTitle: string;

  @Column({ name: 'client_company', nullable: true })
  clientCompany: string;

  @Column({ name: 'client_avatar_url', nullable: true })
  clientAvatarUrl: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 5 })
  rating: number;  // 1-5

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
