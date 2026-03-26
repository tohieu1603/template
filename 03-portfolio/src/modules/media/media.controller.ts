import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { successResponse } from '../../common/dto/api-response.dto';

const mediaService = new MediaService();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: File upload and management
 */

export async function listMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await mediaService.findAll(req.query as any);
    res.json(successResponse(result.media, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const media = await mediaService.findById(req.params.id);
    res.json(successResponse(media));
  } catch (error) { next(error); }
}

export async function uploadMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }
    const media = await mediaService.upload(req.file, req.user?.id ?? 'anonymous', req.body.folder);
    res.status(201).json(successResponse(media, 'File uploaded'));
  } catch (error) { next(error); }
}

export async function updateMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const media = await mediaService.update(req.params.id, req.body);
    res.json(successResponse(media, 'Media updated'));
  } catch (error) { next(error); }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await mediaService.delete(req.params.id);
    res.json(successResponse(null, 'Media deleted'));
  } catch (error) { next(error); }
}
