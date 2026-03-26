import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('instructors')
export class Instructor extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'short_bio', nullable: true })
  shortBio: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  expertise: string[];

  @Column({ nullable: true })
  website: string;

  @Column({ name: 'social_linkedin', nullable: true })
  socialLinkedin: string;

  @Column({ name: 'social_youtube', nullable: true })
  socialYoutube: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'rating_avg', type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingAvg: number;

  @Column({ name: 'total_students', default: 0 })
  totalStudents: number;

  @Column({ name: 'total_courses', default: 0 })
  totalCourses: number;
}
