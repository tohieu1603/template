import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('enrollments')
export class Enrollment extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'enrolled_at', type: 'timestamptz' })
  enrolledAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ name: 'progress_percent', default: 0 })
  progressPercent: number;

  @Column({ name: 'last_lesson_id', type: 'uuid', nullable: true })
  lastLessonId: string;
}
