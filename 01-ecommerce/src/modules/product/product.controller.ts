import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { successResponse } from '../../common/dto/api-response.dto';

const productService = new ProductService();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products with pagination, search, and filters
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, active, archived] }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: brandId
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: featured
 *         schema: { type: string, enum: [true] }
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedResponse' }
 */
export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { products, meta } = await productService.findAll(req.query as any);
    res.json(successResponse(products, undefined, meta));
  } catch (error) { next(error); }
}

export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.findById(req.params.id);
    res.json(successResponse(product));
  } catch (error) { next(error); }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.findBySlug(req.params.slug);
    res.json(successResponse(product));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product with variants (admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, name, basePrice, sku]
 *             properties:
 *               categoryId: { type: string }
 *               brandId: { type: string }
 *               name: { type: string }
 *               basePrice: { type: number }
 *               sku: { type: string }
 *               status: { type: string, enum: [draft, active, archived] }
 *               variants: { type: array, items: { type: object } }
 *     responses:
 *       201:
 *         description: Product created
 */
export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(successResponse(product, 'Product created'));
  } catch (error) { next(error); }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.json(successResponse(product, 'Product updated'));
  } catch (error) { next(error); }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.delete(req.params.id);
    res.json(successResponse(null, 'Product deleted'));
  } catch (error) { next(error); }
}

// Variant operations
export async function addVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const variant = await productService.addVariant(req.params.id, req.body);
    res.status(201).json(successResponse(variant, 'Variant added'));
  } catch (error) { next(error); }
}

export async function updateVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const variant = await productService.updateVariant(req.params.variantId, req.body);
    res.json(successResponse(variant, 'Variant updated'));
  } catch (error) { next(error); }
}

export async function deleteVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.deleteVariant(req.params.variantId);
    res.json(successResponse(null, 'Variant deleted'));
  } catch (error) { next(error); }
}
