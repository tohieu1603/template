import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new MediaService();

export const listMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.media, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await service.findById(req.params.id);
    res.json(successResponse(media));
  } catch (e) { next(e); }
};

export const uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    const media = await service.upload(req.file, req.user!.id, req.body.folder);
    res.status(201).json(successResponse(media, 'File uploaded'));
  } catch (e) { next(e); }
};

export const updateMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await service.update(req.params.id, req.body);
    res.json(successResponse(media, 'Media updated'));
  } catch (e) { next(e); }
};

export const deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Media deleted'));
  } catch (e) { next(e); }
};
