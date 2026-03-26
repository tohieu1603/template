import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listBrands, getBrand, createBrand, updateBrand, deleteBrand } from './brand.controller';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from './dto/brand.dto';

const router = Router();

router.get('/', validateDto(BrandQueryDto, 'query'), listBrands);
router.get('/:id', getBrand);
router.post('/', auth(), rbac('brands.create'), validateDto(CreateBrandDto), createBrand);
router.put('/:id', auth(), rbac('brands.update'), validateDto(UpdateBrandDto), updateBrand);
router.delete('/:id', auth(), rbac('brands.delete'), deleteBrand);

export default router;
