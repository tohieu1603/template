import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('contact_submissions')
export class ContactSubmission extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'admin_reply', type: 'text', nullable: true })
  adminReply: string;
}
