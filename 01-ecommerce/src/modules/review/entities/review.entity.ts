import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  @Index()
  productId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'order_item_id', type: 'uuid', nullable: true })
  orderItemId: string;

  @Column({ type: 'smallint' })
  rating: number;  // 1-5

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'admin_reply', nullable: true, type: 'text' })
  adminReply: string;

  @Column({ name: 'replied_at', type: 'timestamptz', nullable: true })
  repliedAt: Date;

  // Populated via joins
  images?: any[];
  user?: any;
}
