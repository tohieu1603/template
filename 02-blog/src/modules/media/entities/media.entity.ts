import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('media')
export class Media extends BaseEntity {
  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy: string;

  @Column()
  filename: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ nullable: true })
  type: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column()
  url: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true, length: 500 })
  title: string;

  @Column({ name: 'alt_text', nullable: true, length: 500 })
  altText: string;

  @Column({ nullable: true, type: 'text' })
  caption: string;

  @Column({ nullable: true })
  folder: string;

  @Column({ name: 'used_in', type: 'jsonb', nullable: true })
  usedIn: any[];

  @Column({ type: 'jsonb', nullable: true })
  assignments: any[];
}
