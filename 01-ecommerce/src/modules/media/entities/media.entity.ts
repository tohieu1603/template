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
  type: string;  // 'image', 'video', 'document'

  @Column({ name: 'size_bytes' })
  sizeBytes: number;

  @Column()
  url: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ name: 'alt_text', nullable: true })
  altText: string;

  @Column({ nullable: true })
  folder: string;
}
