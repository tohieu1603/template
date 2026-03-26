import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listMedia, getMedia, uploadMedia, updateMedia, deleteMedia } from './media.controller';
import { MediaQueryDto, UpdateMediaDto } from './dto/media.dto';
import { env } from '../../config/env.config';

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: File upload and management
 */

if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

const router = Router();

router.get('/', auth(), rbac('media.view'), validateDto(MediaQueryDto, 'query'), listMedia);
router.get('/:id', auth(), getMedia);
router.post('/upload', auth(), upload.single('file'), uploadMedia);
router.put('/:id', auth(), rbac('media.update'), validateDto(UpdateMediaDto), updateMedia);
router.delete('/:id', auth(), rbac('media.delete'), deleteMedia);

export default router;
