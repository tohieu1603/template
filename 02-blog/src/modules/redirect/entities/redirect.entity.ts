import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('redirects')
export class Redirect extends BaseEntity {
  @Column({ name: 'from_path', unique: true, length: 500 })
  fromPath: string;

  @Column({ name: 'to_path', length: 500 })
  toPath: string;

  @Column({ name: 'status_code', type: 'smallint', default: 301 })
  statusCode: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'hit_count', default: 0 })
  hitCount: number;
}
