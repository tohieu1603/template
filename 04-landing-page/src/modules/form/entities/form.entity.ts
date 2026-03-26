import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('forms')
export class Form extends BaseEntity {
  @Column({ name: 'page_id', type: 'uuid', nullable: true })
  pageId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'jsonb' })
  fields: Array<{
    name: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;

  @Column({ name: 'submit_button_text', default: 'Submit' })
  submitButtonText: string;

  @Column({ name: 'success_message', nullable: true })
  successMessage: string;

  @Column({ name: 'redirect_url', nullable: true })
  redirectUrl: string;

  @Column({ name: 'notification_email', nullable: true })
  notificationEmail: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'submission_count', default: 0 })
  submissionCount: number;
}
