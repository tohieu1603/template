import { Request, Response, NextFunction } from 'express';
import { PageContentService } from './page-content.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new PageContentService();

export const listPages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.pages, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getPageBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await service.findBySlug(req.params.slug);
    res.json(successResponse(page));
  } catch (e) { next(e); }
};

export const createPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await service.create(req.body);
    res.status(201).json(successResponse(page, 'Page created'));
  } catch (e) { next(e); }
};

export const updatePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await service.update(req.params.id, req.body);
    res.json(successResponse(page, 'Page updated'));
  } catch (e) { next(e); }
};

export const deletePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Page deleted'));
  } catch (e) { next(e); }
};
