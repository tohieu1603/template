import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { successResponse } from '../../common/dto/api-response.dto';

const categoryService = new CategoryService();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product category management
 */

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { categories, meta } = await categoryService.findAll(req.query as any);
    res.json(successResponse(categories, undefined, meta));
  } catch (error) { next(error); }
}

export async function getCategoryTree(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tree = await categoryService.findTree();
    res.json(successResponse(tree));
  } catch (error) { next(error); }
}

export async function getCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.findById(req.params.id);
    res.json(successResponse(category));
  } catch (error) { next(error); }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json(successResponse(category, 'Category created'));
  } catch (error) { next(error); }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.update(req.params.id, req.body);
    res.json(successResponse(category, 'Category updated'));
  } catch (error) { next(error); }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await categoryService.delete(req.params.id);
    res.json(successResponse(null, 'Category deleted'));
  } catch (error) { next(error); }
}
