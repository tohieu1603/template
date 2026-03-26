import { Request, Response, NextFunction } from 'express';
import { PageContentService } from './page-content.service';
import { successResponse } from '../../common/dto/api-response.dto';

const pageContentService = new PageContentService();

/**
 * @swagger
 * tags:
 *   name: Pages
 *   description: Static page content management
 */

export async function listPages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await pageContentService.findAll(req.query as any);
    res.json(successResponse(result.pages, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageContentService.findBySlug(req.params.slug);
    res.json(successResponse(page));
  } catch (error) { next(error); }
}

export async function createPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageContentService.create(req.body, req.user?.id ?? '');
    res.status(201).json(successResponse(page, 'Page created'));
  } catch (error) { next(error); }
}

export async function updatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageContentService.update(req.params.slug, req.body, req.user?.id ?? '');
    res.json(successResponse(page, 'Page updated'));
  } catch (error) { next(error); }
}

export async function deletePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await pageContentService.delete(req.params.slug);
    res.json(successResponse(null, 'Page deleted'));
  } catch (error) { next(error); }
}
