import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ default: 0 })
  score: number;

  @Column({ default: false })
  passed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  answers: Array<{ questionId: string; answer: unknown; isCorrect: boolean }>;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
