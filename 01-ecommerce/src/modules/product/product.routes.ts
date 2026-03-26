import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import {
  listProducts, getProduct, getProductBySlug, createProduct, updateProduct, deleteProduct,
  addVariant, updateVariant, deleteVariant,
} from './product.controller';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, CreateProductVariantDto } from './dto/product.dto';

const router = Router();

// Public endpoints
router.get('/', validateDto(ProductQueryDto, 'query'), listProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

// Admin product management
router.post('/', auth(), rbac('products.create'), validateDto(CreateProductDto), createProduct);
router.put('/:id', auth(), rbac('products.update'), validateDto(UpdateProductDto), updateProduct);
router.delete('/:id', auth(), rbac('products.delete'), deleteProduct);

// Variant management
router.post('/:id/variants', auth(), rbac('products.update'), validateDto(CreateProductVariantDto), addVariant);
router.put('/:id/variants/:variantId', auth(), rbac('products.update'), updateVariant);
router.delete('/:id/variants/:variantId', auth(), rbac('products.update'), deleteVariant);

export default router;
