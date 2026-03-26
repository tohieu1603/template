import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @Column({ unique: true })
  slug: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  tagline: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @Column({ name: 'resume_url', nullable: true })
  resumeUrl: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'is_available', default: false })
  isAvailable: boolean;

  @Column({ name: 'availability_text', nullable: true })
  availabilityText: string;

  @Column({ name: 'social_github', nullable: true })
  socialGithub: string;

  @Column({ name: 'social_linkedin', nullable: true })
  socialLinkedin: string;

  @Column({ name: 'social_twitter', nullable: true })
  socialTwitter: string;

  @Column({ name: 'social_dribbble', nullable: true })
  socialDribbble: string;

  @Column({ name: 'social_behance', nullable: true })
  socialBehance: string;

  @Column({ name: 'social_youtube', nullable: true })
  socialYoutube: string;

  @Column({ name: 'social_instagram', nullable: true })
  socialInstagram: string;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true, type: 'text' })
  metaDescription: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
