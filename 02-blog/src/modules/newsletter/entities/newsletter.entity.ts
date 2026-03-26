import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('newsletters')
export class Newsletter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, length: 150 })
  name: string;

  @Column({ name: 'is_subscribed', default: true })
  isSubscribed: boolean;

  @Column({ name: 'subscribed_at', type: 'timestamptz', default: () => 'NOW()' })
  subscribedAt: Date;

  @Column({ name: 'unsubscribed_at', type: 'timestamptz', nullable: true })
  unsubscribedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
