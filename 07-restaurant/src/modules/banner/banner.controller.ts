import { Request, Response, NextFunction } from 'express';
import { BannerService } from './banner.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new BannerService();

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Banner management
 */

export const listBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.banners, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = await service.findById(req.params.id);
    res.json(successResponse(b));
  } catch (e) { next(e); }
};

export const createBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = await service.create(req.body);
    res.status(201).json(successResponse(b, 'Banner created'));
  } catch (e) { next(e); }
};

export const updateBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = await service.update(req.params.id, req.body);
    res.json(successResponse(b, 'Banner updated'));
  } catch (e) { next(e); }
};

export const deleteBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Banner deleted'));
  } catch (e) { next(e); }
};
