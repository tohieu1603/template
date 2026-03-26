import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Technology } from '../../technology/entities/technology.entity';

@Entity('projects')
export class Project extends BaseEntity {
  @Column({ name: 'profile_id', type: 'uuid', nullable: true })
  @Index()
  profileId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @Column({ name: 'client_name', nullable: true })
  clientName: string;

  @Column({ name: 'client_logo_url', nullable: true })
  clientLogoUrl: string;

  @Column({ name: 'project_url', nullable: true })
  projectUrl: string;

  @Column({ name: 'source_url', nullable: true })
  sourceUrl: string;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ name: 'duration_text', nullable: true })
  durationText: string;

  @Column({ name: 'role_in_project', nullable: true })
  roleInProject: string;

  @Column({ default: 'completed' })
  status: string;  // 'completed' | 'in_progress' | 'planned'

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_case_study', default: false })
  isCaseStudy: boolean;

  @Column({ name: 'case_study_content', nullable: true, type: 'text' })
  caseStudyContent: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, type: 'text' })
  metaDescription: string;

  @ManyToMany(() => Technology, { eager: false })
  @JoinTable({
    name: 'project_technologies',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'technology_id', referencedColumnName: 'id' },
  })
  technologies: Technology[];
}
