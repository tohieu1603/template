import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'webhook_id', type: 'uuid' })
  @Index()
  webhookId: string;

  @Column()
  event: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Column({ name: 'response_status', nullable: true })
  responseStatus: number;

  @Column({ name: 'response_body', nullable: true, type: 'text' })
  responseBody: string;

  @Column({ default: false })
  success: boolean;

  @Column({ name: 'attempted_at', type: 'timestamptz' })
  attemptedAt: Date;
}
