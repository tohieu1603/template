import { Entity, Column, Index, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'post_id', type: 'uuid' })
  @Index()
  postId: string;

  @Column({ name: 'collection_id', type: 'uuid', nullable: true })
  @Index()
  collectionId: string;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
