import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('experiences')
export class Experience extends BaseEntity {
  @Column({ name: 'profile_id', type: 'uuid' })
  @Index()
  profileId: string;

  @Column({ default: 'work' })
  type: string;  // 'work' | 'education' | 'volunteer'

  @Column()
  title: string;

  @Column()
  organization: string;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
