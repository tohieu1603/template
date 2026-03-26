import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('skills')
export class Skill extends BaseEntity {
  @Column({ name: 'profile_id', type: 'uuid' })
  @Index()
  profileId: string;

  @Column()
  name: string;

  @Column({ default: 'frontend' })
  category: string;  // 'frontend' | 'backend' | 'design' | 'devops' | 'soft_skill'

  @Column({ type: 'int', default: 50 })
  level: number;  // 1-100

  @Column({ name: 'years_experience', type: 'float', nullable: true })
  yearsExperience: number;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
