import { Router } from 'express';
import { listBanners, getBanner, createBanner, updateBanner, deleteBanner } from './banner.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

const router = Router();

router.get('/', listBanners);
router.get('/:id', getBanner);
router.post('/', auth(), rbac('banners.create'), validateDto(CreateBannerDto), createBanner);
router.put('/:id', auth(), rbac('banners.update'), validateDto(UpdateBannerDto), updateBanner);
router.delete('/:id', auth(), rbac('banners.delete'), deleteBanner);

export default router;
