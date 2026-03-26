import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('blog_tags')
export class BlogTag extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;
}
