import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('series')
export class Series extends BaseEntity {
  @Column({ name: 'author_id', type: 'uuid' })
  @Index()
  authorId: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @Column({ default: 'draft' })
  status: string;
}
