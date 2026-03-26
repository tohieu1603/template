import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @Column({ name: 'post_id', type: 'uuid' })
  @Index()
  postId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_approved', default: true })
  isApproved: boolean;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;
}
