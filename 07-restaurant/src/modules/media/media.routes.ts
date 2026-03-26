import { Router } from 'express';
import { listMedia, getMedia, uploadMedia, updateMedia, deleteMedia, upload } from './media.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { UpdateMediaDto, MediaQueryDto } from './dto/media.dto';

const router = Router();

router.get('/', auth(), validateDto(MediaQueryDto, 'query'), listMedia);
router.get('/:id', auth(), getMedia);
router.post('/', auth(), rbac('media.create'), upload.single('file'), uploadMedia);
router.put('/:id', auth(), rbac('media.update'), validateDto(UpdateMediaDto), updateMedia);
router.delete('/:id', auth(), rbac('media.delete'), deleteMedia);

export default router;
