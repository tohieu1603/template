import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('contact_submissions')
export class Contact extends BaseEntity {
  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'budget_range', nullable: true })
  budgetRange: string;

  @Column({ name: 'project_type', nullable: true })
  projectType: string;

  @Column({ nullable: true })
  timeline: string;

  @Column({ default: 'new' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;
}
