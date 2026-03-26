import { Request, Response, NextFunction } from 'express';
import { BannerService } from './banner.service';
import { successResponse } from '../../common/dto/api-response.dto';

const bannerService = new BannerService();

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Promotional banners
 */

export async function listBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await bannerService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function getBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const banner = await bannerService.findById(req.params.id);
    res.json(successResponse(banner));
  } catch (error) {
    next(error);
  }
}

export async function createBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const banner = await bannerService.create(req.body);
    res.status(201).json(successResponse(banner, 'Banner created'));
  } catch (error) {
    next(error);
  }
}

export async function updateBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const banner = await bannerService.update(req.params.id, req.body);
    res.json(successResponse(banner, 'Banner updated'));
  } catch (error) {
    next(error);
  }
}

export async function deleteBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await bannerService.delete(req.params.id);
    res.json(successResponse(null, 'Banner deleted'));
  } catch (error) {
    next(error);
  }
}
