import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listBanners, getBanner, createBanner, updateBanner, deleteBanner, trackBannerView, trackBannerClick } from './banner.controller';
import { CreateBannerDto, UpdateBannerDto, BannerQueryDto } from './dto/banner.dto';

const router = Router();

router.get('/', validateDto(BannerQueryDto, 'query'), listBanners);
router.get('/:id', getBanner);
router.post('/:id/view', trackBannerView);
router.post('/:id/click', trackBannerClick);
router.post('/', auth(), rbac('banners.create'), validateDto(CreateBannerDto), createBanner);
router.put('/:id', auth(), rbac('banners.update'), validateDto(UpdateBannerDto), updateBanner);
router.delete('/:id', auth(), rbac('banners.delete'), deleteBanner);

export default router;
