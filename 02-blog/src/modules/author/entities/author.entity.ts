import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('authors')
export class Author extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ name: 'short_bio', nullable: true, length: 500 })
  shortBio: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', array: true, nullable: true })
  expertise: string[];

  @Column({ type: 'jsonb', nullable: true })
  experience: any[];

  @Column({ type: 'jsonb', nullable: true })
  education: any[];

  @Column({ type: 'jsonb', nullable: true })
  certifications: any[];

  @Column({ type: 'jsonb', nullable: true })
  achievements: any[];

  @Column({ type: 'jsonb', nullable: true })
  skills: any[];

  @Column({ type: 'jsonb', nullable: true })
  publications: any[];

  @Column({ type: 'jsonb', nullable: true })
  articles: any[];

  @Column({ nullable: true, length: 500 })
  website: string;

  @Column({ name: 'social_twitter', nullable: true })
  socialTwitter: string;

  @Column({ name: 'social_linkedin', nullable: true, length: 500 })
  socialLinkedin: string;

  @Column({ name: 'social_facebook', nullable: true, length: 500 })
  socialFacebook: string;

  @Column({ name: 'social_github', nullable: true })
  socialGithub: string;

  @Column({ name: 'social_youtube', nullable: true, length: 500 })
  socialYoutube: string;

  @Column({ name: 'same_as', type: 'text', array: true, nullable: true })
  sameAs: string[];

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, length: 500 })
  metaDescription: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
