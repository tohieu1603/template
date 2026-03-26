import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ name: 'question_type', default: 'single_choice' })
  questionType: string;

  @Column({ type: 'jsonb' })
  options: Array<{ text: string; isCorrect: boolean }>;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ default: 1 })
  points: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
