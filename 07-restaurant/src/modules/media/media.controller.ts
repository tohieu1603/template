import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { successResponse } from '../../common/dto/api-response.dto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env.config';

const uploadDir = env.UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
  },
});

export const upload = multer({ storage, limits: { fileSize: env.MAX_FILE_SIZE } });

const service = new MediaService();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media file management
 */

export const listMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.media, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const m = await service.findById(req.params.id);
    res.json(successResponse(m));
  } catch (e) { next(e); }
};

export const uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }
    const m = await service.upload(req.file, req.user?.id);
    res.status(201).json(successResponse(m, 'File uploaded'));
  } catch (e) { next(e); }
};

export const updateMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const m = await service.update(req.params.id, req.body);
    res.json(successResponse(m, 'Media updated'));
  } catch (e) { next(e); }
};

export const deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Media deleted'));
  } catch (e) { next(e); }
};
