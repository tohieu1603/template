import { Request, Response, NextFunction } from 'express';
import { BrandService } from './brand.service';
import { successResponse } from '../../common/dto/api-response.dto';

const brandService = new BrandService();

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Brand management
 */

export async function listBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { brands, meta } = await brandService.findAll(req.query as any);
    res.json(successResponse(brands, undefined, meta));
  } catch (error) { next(error); }
}

export async function getBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const brand = await brandService.findById(req.params.id);
    res.json(successResponse(brand));
  } catch (error) { next(error); }
}

export async function createBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const brand = await brandService.create(req.body);
    res.status(201).json(successResponse(brand, 'Brand created'));
  } catch (error) { next(error); }
}

export async function updateBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const brand = await brandService.update(req.params.id, req.body);
    res.json(successResponse(brand, 'Brand updated'));
  } catch (error) { next(error); }
}

export async function deleteBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await brandService.delete(req.params.id);
    res.json(successResponse(null, 'Brand deleted'));
  } catch (error) { next(error); }
}
