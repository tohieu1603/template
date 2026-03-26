import { Request, Response, NextFunction } from 'express';
import { PageContentService } from './page-content.service';
import { successResponse } from '../../common/dto/api-response.dto';

const pageContentService = new PageContentService();

export const listPages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pageContentService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await pageContentService.findBySlug(req.params.slug);
    res.json(successResponse(page));
  } catch (error) { next(error); }
};

export const createPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await pageContentService.create(req.body);
    res.status(201).json(successResponse(page, 'Page created'));
  } catch (error) { next(error); }
};

export const updatePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await pageContentService.update(req.params.slug, req.body);
    res.json(successResponse(page, 'Page updated'));
  } catch (error) { next(error); }
};

export const deletePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await pageContentService.delete(req.params.slug);
    res.json(successResponse(null, 'Page deleted'));
  } catch (error) { next(error); }
};
