import { Request, Response, NextFunction } from 'express';
import { MenuCategoryService } from './menu-category.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new MenuCategoryService();

/**
 * @swagger
 * tags:
 *   name: MenuCategories
 *   description: Menu category management
 */

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.categories, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await service.findById(req.params.id);
    res.json(successResponse(cat));
  } catch (e) { next(e); }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await service.create(req.body);
    res.status(201).json(successResponse(cat, 'Category created'));
  } catch (e) { next(e); }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await service.update(req.params.id, req.body);
    res.json(successResponse(cat, 'Category updated'));
  } catch (e) { next(e); }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Category deleted'));
  } catch (e) { next(e); }
};
