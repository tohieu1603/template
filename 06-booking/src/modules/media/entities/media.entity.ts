import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('media')
export class Media extends BaseEntity {
  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ nullable: true })
  alt: string;

  @Column({ nullable: true })
  title: string;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy: string;
}
