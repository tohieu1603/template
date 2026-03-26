import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ name: 'food_rating', type: 'smallint', nullable: true })
  foodRating: number;

  @Column({ name: 'service_rating', type: 'smallint', nullable: true })
  serviceRating: number;

  @Column({ name: 'ambiance_rating', type: 'smallint', nullable: true })
  ambianceRating: number;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'admin_reply', nullable: true, type: 'text' })
  adminReply: string;

  @Column({ name: 'replied_at', type: 'timestamptz', nullable: true })
  repliedAt: Date;
}
