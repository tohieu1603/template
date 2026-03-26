import { AppDataSource } from '../../config/database.config';
import { PageSection } from './entities/page-section.entity';
import { CreatePageSectionDto, UpdatePageSectionDto, ReorderSectionsDto } from './dto/page-section.dto';
import { NotFoundError } from '../../common/errors/app-error';

export class PageSectionService {
  private repo = AppDataSource.getRepository(PageSection);

  async findByPage(pageId: string) {
    return this.repo.find({ where: { pageId }, order: { sortOrder: 'ASC' } });
  }

  async findOne(id: string) {
    const section = await this.repo.findOne({ where: { id } });
    if (!section) throw new NotFoundError('Page section');
    return section;
  }

  async create(dto: CreatePageSectionDto) {
    const section = this.repo.create(dto);
    return this.repo.save(section);
  }

  async update(id: string, dto: UpdatePageSectionDto) {
    const section = await this.findOne(id);
    Object.assign(section, dto);
    return this.repo.save(section);
  }

  async toggleVisibility(id: string) {
    const section = await this.findOne(id);
    section.isVisible = !section.isVisible;
    return this.repo.save(section);
  }

  async reorder(dto: ReorderSectionsDto) {
    const updates = dto.orders.map(({ id, sortOrder }) =>
      this.repo.update(id, { sortOrder }),
    );
    await Promise.all(updates);
    return { message: 'Reordered successfully' };
  }

  async remove(id: string): Promise<void> {
    const section = await this.findOne(id);
    await this.repo.remove(section);
  }
}
