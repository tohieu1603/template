import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('quizzes')
export class Quiz extends BaseEntity {
  @Column({ name: 'lesson_id', type: 'uuid', unique: true })
  lessonId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'passing_score', default: 70 })
  passingScore: number;

  @Column({ name: 'time_limit_minutes', nullable: true })
  timeLimitMinutes: number;

  @Column({ name: 'max_attempts', default: 3 })
  maxAttempts: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
