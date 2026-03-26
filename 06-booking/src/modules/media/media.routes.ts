import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { env } from '../../config/env.config';
import { listMedia, uploadMedia, deleteMedia } from './media.controller';
import fs from 'fs';

const router = Router();

// Ensure upload dir exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.get('/', auth(), rbac('media.view'), listMedia);
router.post('/upload', auth(), rbac('media.create'), upload.single('file'), uploadMedia);
router.delete('/:id', auth(), rbac('media.delete'), deleteMedia);

export default router;
