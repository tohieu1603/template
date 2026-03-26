import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('leads')
export class Lead extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ default: 'form' })
  source: string; // form | newsletter | manual

  @Column({ default: 'new' })
  status: string; // new | contacted | qualified | converted | lost

  @Column({ default: 0 })
  score: number;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'first_form_id', type: 'uuid', nullable: true })
  firstFormId: string;

  @Column({ name: 'last_activity_at', type: 'timestamptz', nullable: true })
  lastActivityAt: Date;
}
