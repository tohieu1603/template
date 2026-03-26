import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { successResponse } from '../../common/dto/api-response.dto';

const mediaService = new MediaService();

export const listMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mediaService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await mediaService.findById(req.params.id);
    res.json(successResponse(media));
  } catch (error) { next(error); }
};

export const uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    const media = await mediaService.upload(req.file, req.user!.id, req.body.folder);
    res.status(201).json(successResponse(media, 'File uploaded'));
  } catch (error) { next(error); }
};

export const updateMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await mediaService.update(req.params.id, req.body);
    res.json(successResponse(media, 'Media updated'));
  } catch (error) { next(error); }
};

export const deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await mediaService.delete(req.params.id);
    res.json(successResponse(null, 'Media deleted'));
  } catch (error) { next(error); }
};
