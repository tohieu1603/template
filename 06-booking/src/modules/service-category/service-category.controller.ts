import { Request, Response, NextFunction } from 'express';
import { ServiceCategoryService } from './service-category.service';
import { successResponse } from '../../common/dto/api-response.dto';

const serviceCategoryService = new ServiceCategoryService();

/**
 * @swagger
 * tags:
 *   name: ServiceCategories
 *   description: Service category management
 */

export async function listServiceCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await serviceCategoryService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function getServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cat = await serviceCategoryService.findById(req.params.id);
    res.json(successResponse(cat));
  } catch (error) {
    next(error);
  }
}

export async function createServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cat = await serviceCategoryService.create(req.body);
    res.status(201).json(successResponse(cat, 'Category created'));
  } catch (error) {
    next(error);
  }
}

export async function updateServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cat = await serviceCategoryService.update(req.params.id, req.body);
    res.json(successResponse(cat, 'Category updated'));
  } catch (error) {
    next(error);
  }
}

export async function deleteServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await serviceCategoryService.delete(req.params.id);
    res.json(successResponse(null, 'Category deleted'));
  } catch (error) {
    next(error);
  }
}
