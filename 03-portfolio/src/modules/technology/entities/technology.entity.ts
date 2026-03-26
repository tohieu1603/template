import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('technologies')
export class Technology extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  color: string;  // hex color

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string;
}
