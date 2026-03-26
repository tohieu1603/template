import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { listMedia, getMedia, uploadMedia, updateMedia, deleteMedia } from './media.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { env } from '../../config/env.config';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: env.MAX_FILE_SIZE } });

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: File upload management
 */
const router = Router();

router.get('/', auth(), rbac('media.view'), listMedia);
router.get('/:id', auth(), rbac('media.view'), getMedia);
router.post('/upload', auth(), rbac('media.create'), upload.single('file'), uploadMedia);
router.put('/:id', auth(), rbac('media.update'), updateMedia);
router.delete('/:id', auth(), rbac('media.delete'), deleteMedia);

export default router;
