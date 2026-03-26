import { AppDataSource } from '../../config/database.config';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { VariantImage } from './entities/variant-image.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, CreateProductVariantDto } from './dto/product.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { generateSlug } from '../../common/utils/slug.util';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

/**
 * Product service: handles products, variants, images.
 * Uses QueryBuilder for complex join queries.
 */
export class ProductService {
  private productRepo = AppDataSource.getRepository(Product);
  private variantRepo = AppDataSource.getRepository(ProductVariant);
  private imageRepo = AppDataSource.getRepository(VariantImage);

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 10, search, status, categoryId, brandId, minPrice, maxPrice, featured } = query;
    const offset = (page - 1) * limit;

    const qb = this.productRepo.createQueryBuilder('p')
      .orderBy('p.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (search) {
      qb.where('(p.name ILIKE :s OR p.sku ILIKE :s)', { s: `%${search}%` });
    }
    if (status) qb.andWhere('p.status = :status', { status });
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (brandId) qb.andWhere('p.brandId = :brandId', { brandId });
    if (minPrice) qb.andWhere('p.basePrice >= :minPrice', { minPrice: parseFloat(minPrice) });
    if (maxPrice) qb.andWhere('p.basePrice <= :maxPrice', { maxPrice: parseFloat(maxPrice) });
    if (featured === 'true') qb.andWhere('p.isFeatured = true');

    const [products, total] = await qb.getManyAndCount();

    // Load first variant image for list view
    const enriched = await Promise.all(products.map((p) => this.enrichProduct(p)));
    return { products: enriched, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundError('Product');
    return this.enrichProductFull(product);
  }

  async findBySlug(slug: string) {
    const product = await this.productRepo.findOne({ where: { slug } });
    if (!product) throw new NotFoundError('Product');
    return this.enrichProductFull(product);
  }

  async create(dto: CreateProductDto): Promise<any> {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.productRepo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Slug '${slug}' already in use`);

    const skuExists = await this.productRepo.findOne({ where: { sku: dto.sku } });
    if (skuExists) throw new ConflictError(`SKU '${dto.sku}' already in use`);

    const { variants, ...productData } = dto;
    const product = await this.productRepo.save(this.productRepo.create({ ...productData, slug }));

    if (variants?.length) {
      await this.createVariants(product.id, variants);
    }

    return this.findById(product.id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<any> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundError('Product');
    Object.assign(product, dto);
    await this.productRepo.save(product);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundError('Product');
    await this.productRepo.remove(product);
  }

  // Variant operations
  async addVariant(productId: string, dto: CreateProductVariantDto) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundError('Product');

    const skuExists = await this.variantRepo.findOne({ where: { sku: dto.sku } });
    if (skuExists) throw new ConflictError(`SKU '${dto.sku}' already in use`);

    const { attributeValueIds, images, ...variantData } = dto;
    const variant = await this.variantRepo.save(this.variantRepo.create({ ...variantData, productId }));

    if (attributeValueIds?.length) {
      const values = attributeValueIds.map((id) =>
        `('${variant.id}', '${id}')`,
      );
      await AppDataSource.query(
        `INSERT INTO product_variant_attributes (variant_id, attribute_value_id) VALUES ${values.join(',')} ON CONFLICT DO NOTHING`,
      );
    }

    if (images?.length) {
      const imgs = images.map((img) => this.imageRepo.create({ ...img, variantId: variant.id }));
      await this.imageRepo.save(imgs);
    }

    return this.getVariantWithDetails(variant.id);
  }

  async updateVariant(variantId: string, dto: Partial<CreateProductVariantDto>) {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundError('Variant');

    const { attributeValueIds, images, ...variantData } = dto;
    Object.assign(variant, variantData);
    await this.variantRepo.save(variant);

    return this.getVariantWithDetails(variantId);
  }

  async deleteVariant(variantId: string): Promise<void> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundError('Variant');
    await this.variantRepo.remove(variant);
  }

  private async createVariants(productId: string, variants: CreateProductVariantDto[]) {
    for (const dto of variants) {
      await this.addVariant(productId, dto);
    }
  }

  private async enrichProduct(product: Product) {
    const variant = await this.variantRepo.findOne({
      where: { productId: product.id, isActive: true },
      order: { createdAt: 'ASC' },
    });
    const image = variant
      ? await this.imageRepo.findOne({ where: { variantId: variant.id, isPrimary: true } })
      : null;

    return { ...product, primaryImage: image?.url ?? null, variantCount: 0 };
  }

  private async enrichProductFull(product: Product) {
    const variants = await this.variantRepo.find({
      where: { productId: product.id },
      order: { createdAt: 'ASC' },
    });

    const variantsWithDetails = await Promise.all(
      variants.map((v) => this.getVariantWithDetails(v.id)),
    );

    return { ...product, variants: variantsWithDetails };
  }

  private async getVariantWithDetails(variantId: string) {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) return null;

    const [images, attrValues] = await Promise.all([
      this.imageRepo.find({ where: { variantId }, order: { sortOrder: 'ASC' } }),
      AppDataSource.query(
        `SELECT av.*, a.name AS attribute_name, a.type AS attribute_type
         FROM attribute_values av
         JOIN attributes a ON a.id = av.attribute_id
         JOIN product_variant_attributes pva ON pva.attribute_value_id = av.id
         WHERE pva.variant_id = $1`,
        [variantId],
      ),
    ]);

    return { ...variant, images, attributeValues: attrValues };
  }
}
