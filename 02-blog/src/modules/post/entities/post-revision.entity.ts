import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('post_revisions')
export class PostRevision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id', type: 'uuid' })
  @Index()
  postId: string;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'content_blocks', type: 'jsonb', nullable: true })
  contentBlocks: any;

  @Column({ name: 'revised_by', type: 'uuid' })
  revisedBy: string;

  @Column({ name: 'revision_note', nullable: true, length: 300 })
  revisionNote: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
