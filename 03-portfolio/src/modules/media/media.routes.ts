import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { listMedia, getMedia, uploadMedia, updateMedia, deleteMedia } from './media.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { env } from '../../config/env.config';

// Ensure upload dir exists
if (!fs.existsSync(env.UPLOAD_DIR)) fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: env.MAX_FILE_SIZE } });

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: File upload and management
 */

router.get('/', auth(), rbac('media.view'), listMedia);
router.get('/:id', auth(), rbac('media.view'), getMedia);
router.post('/upload', auth(), rbac('media.create'), upload.single('file'), uploadMedia);
router.put('/:id', auth(), rbac('media.update'), updateMedia);
router.delete('/:id', auth(), rbac('media.delete'), deleteMedia);

export default router;
