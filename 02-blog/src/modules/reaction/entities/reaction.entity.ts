import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('reactions')
export class Reaction {
  @PrimaryColumn({ name: 'post_id', type: 'uuid' })
  postId: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ length: 20 })
  type: string;  // 'like','love','insightful','funny','sad'

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
