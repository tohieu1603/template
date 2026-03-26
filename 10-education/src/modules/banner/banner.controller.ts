import { Request, Response, NextFunction } from 'express';
import { BannerService } from './banner.service';
import { successResponse } from '../../common/dto/api-response.dto';

const bannerService = new BannerService();

export const listBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await bannerService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await bannerService.findById(req.params.id);
    res.json(successResponse(banner));
  } catch (error) { next(error); }
};

export const createBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await bannerService.create(req.body);
    res.status(201).json(successResponse(banner, 'Banner created'));
  } catch (error) { next(error); }
};

export const updateBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await bannerService.update(req.params.id, req.body);
    res.json(successResponse(banner, 'Banner updated'));
  } catch (error) { next(error); }
};

export const deleteBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await bannerService.delete(req.params.id);
    res.json(successResponse(null, 'Banner deleted'));
  } catch (error) { next(error); }
};
