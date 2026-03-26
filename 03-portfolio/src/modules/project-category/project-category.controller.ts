import { Request, Response, NextFunction } from 'express';
import { ProjectCategoryService } from './project-category.service';
import { successResponse } from '../../common/dto/api-response.dto';

const projectCategoryService = new ProjectCategoryService();

/**
 * @swagger
 * tags:
 *   name: ProjectCategories
 *   description: Project category management
 */

export async function listProjectCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await projectCategoryService.findAll(req.query as any);
    res.json(successResponse(result.categories, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getProjectCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cat = await projectCategoryService.findById(req.params.id);
    res.json(successResponse(cat));
  } catch (error) { next(error); }
}

export async function createProjectCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cat = await projectCategoryService.create(req.body);
    res.status(201).json(successResponse(cat, 'Category created'));
  } catch (error) { next(error); }
}

export async function updateProjectCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cat = await projectCategoryService.update(req.params.id, req.body);
    res.json(successResponse(cat, 'Category updated'));
  } catch (error) { next(error); }
}

export async function deleteProjectCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await projectCategoryService.delete(req.params.id);
    res.json(successResponse(null, 'Category deleted'));
  } catch (error) { next(error); }
}
