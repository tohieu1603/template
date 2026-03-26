import { AppDataSource } from '../../config/database.config';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemOption } from './entities/menu-item-option.entity';
import { MenuOptionValue } from './entities/menu-option-value.entity';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto, CreateMenuItemOptionDto, CreateMenuOptionValueDto } from './dto/menu-item.dto';
import { NotFoundError, ConflictError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug, generateUniqueSlug } from '../../common/utils/slug.util';

export class MenuItemService {
  private itemRepo = AppDataSource.getRepository(MenuItem);
  private optionRepo = AppDataSource.getRepository(MenuItemOption);
  private valueRepo = AppDataSource.getRepository(MenuOptionValue);

  async findAll(query: MenuItemQueryDto) {
    const { page = 1, limit = 10, search, categoryId, isAvailable, isFeatured, isVegetarian } = query;
    const qb = this.itemRepo.createQueryBuilder('i').orderBy('i.sortOrder', 'ASC').addOrderBy('i.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('i.name ILIKE :s OR i.description ILIKE :s', { s: `%${search}%` });
    if (categoryId) qb.andWhere('i.categoryId = :categoryId', { categoryId });
    if (isAvailable !== undefined) qb.andWhere('i.isAvailable = :isAvailable', { isAvailable });
    if (isFeatured !== undefined) qb.andWhere('i.isFeatured = :isFeatured', { isFeatured });
    if (isVegetarian !== undefined) qb.andWhere('i.isVegetarian = :isVegetarian', { isVegetarian });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<MenuItem> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Menu item');
    return item;
  }

  async findByIdWithOptions(id: string) {
    const item = await this.findById(id);
    const options = await this.optionRepo.find({ where: { menuItemId: id }, order: { sortOrder: 'ASC' } });
    const optionsWithValues = await Promise.all(
      options.map(async (opt) => {
        const values = await this.valueRepo.find({ where: { optionId: opt.id }, order: { sortOrder: 'ASC' } });
        return { ...opt, values };
      }),
    );
    return { ...item, options: optionsWithValues };
  }

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    let slug = generateSlug(dto.name);
    const existing = await this.itemRepo.findOne({ where: { slug } });
    if (existing) slug = generateUniqueSlug(dto.name, Date.now());
    return this.itemRepo.save(this.itemRepo.create({ ...dto, slug }));
  }

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.findById(id);
    if (dto.name && dto.name !== item.name) {
      let slug = generateSlug(dto.name);
      const existing = await this.itemRepo.findOne({ where: { slug } });
      if (existing && existing.id !== id) slug = generateUniqueSlug(dto.name, Date.now());
      item.slug = slug;
    }
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async delete(id: string): Promise<void> {
    const item = await this.findById(id);
    await this.itemRepo.remove(item);
  }

  async addOption(itemId: string, dto: CreateMenuItemOptionDto): Promise<MenuItemOption> {
    await this.findById(itemId);
    return this.optionRepo.save(this.optionRepo.create({ ...dto, menuItemId: itemId }));
  }

  async deleteOption(itemId: string, optId: string): Promise<void> {
    const opt = await this.optionRepo.findOne({ where: { id: optId, menuItemId: itemId } });
    if (!opt) throw new NotFoundError('Menu item option');
    await this.optionRepo.remove(opt);
  }

  async addOptionValue(itemId: string, optId: string, dto: CreateMenuOptionValueDto): Promise<MenuOptionValue> {
    await this.findById(itemId);
    const opt = await this.optionRepo.findOne({ where: { id: optId, menuItemId: itemId } });
    if (!opt) throw new NotFoundError('Menu item option');
    return this.valueRepo.save(this.valueRepo.create({ ...dto, optionId: optId }));
  }

  async deleteOptionValue(optId: string, valueId: string): Promise<void> {
    const val = await this.valueRepo.findOne({ where: { id: valueId, optionId: optId } });
    if (!val) throw new NotFoundError('Option value');
    await this.valueRepo.remove(val);
  }
}
