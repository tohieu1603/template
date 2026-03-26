import { Request, Response, NextFunction } from 'express';
import { CourseCategoryService } from './course-category.service';
import { successResponse } from '../../common/dto/api-response.dto';

const courseCategoryService = new CourseCategoryService();

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await courseCategoryService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tree = await courseCategoryService.findTree();
    res.json(successResponse(tree));
  } catch (error) { next(error); }
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const param = req.params.slug;
    const cat = UUID_REGEX.test(param)
      ? await courseCategoryService.findById(param)
      : await courseCategoryService.findBySlug(param);
    res.json(successResponse(cat));
  } catch (error) { next(error); }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await courseCategoryService.create(req.body);
    res.status(201).json(successResponse(cat, 'Category created'));
  } catch (error) { next(error); }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await courseCategoryService.update(req.params.id, req.body);
    res.json(successResponse(cat, 'Category updated'));
  } catch (error) { next(error); }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await courseCategoryService.delete(req.params.id);
    res.json(successResponse(null, 'Category deleted'));
  } catch (error) { next(error); }
};
