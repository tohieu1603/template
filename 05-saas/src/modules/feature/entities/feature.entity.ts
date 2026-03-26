import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('features')
export class Feature extends BaseEntity {
  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'is_enabled', default: false })
  isEnabled: boolean;
}
