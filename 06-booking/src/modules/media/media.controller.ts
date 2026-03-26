import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { successResponse } from '../../common/dto/api-response.dto';
import { env } from '../../config/env.config';
import path from 'path';
import fs from 'fs';

const mediaService = new MediaService();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: File upload management
 */

/**
 * @swagger
 * /media:
 *   get:
 *     tags: [Media]
 *     summary: List all media files
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: Media list }
 */
export async function listMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await mediaService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) {
    next(error);
  }
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: File uploaded }
 */
export async function uploadMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const media = await mediaService.save({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      fileUrl,
      uploadedBy: req.user?.id,
    });

    res.status(201).json(successResponse(media, 'File uploaded successfully'));
  } catch (error) {
    next(error);
  }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const media = await mediaService.findById(req.params.id);
    if (fs.existsSync(media.filePath)) {
      fs.unlinkSync(media.filePath);
    }
    await mediaService.delete(req.params.id);
    res.json(successResponse(null, 'Media deleted'));
  } catch (error) {
    next(error);
  }
}
