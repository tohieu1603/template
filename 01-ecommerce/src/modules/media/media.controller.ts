import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { successResponse } from '../../common/dto/api-response.dto';
import { ValidationError } from '../../common/errors/app-error';

const mediaService = new MediaService();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: File upload and media management
 */

export async function listMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { media, meta } = await mediaService.findAll(req.query as any);
    res.json(successResponse(media, undefined, meta));
  } catch (error) { next(error); }
}

export async function getMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const media = await mediaService.findById(req.params.id);
    res.json(successResponse(media));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /media/upload:
 *   post:
 *     tags: [Media]
 *     summary: Upload a file
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
export async function uploadMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw new ValidationError('No file uploaded');
    const media = await mediaService.upload(req.file, req.user!.id, req.body.folder);
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
