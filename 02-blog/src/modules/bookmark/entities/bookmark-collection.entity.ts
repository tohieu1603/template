import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('bookmark_collections')
export class BookmarkCollection extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
