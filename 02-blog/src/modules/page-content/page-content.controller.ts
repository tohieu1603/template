import { Request, Response, NextFunction } from 'express';
import { PageContentService } from './page-content.service';
import { successResponse } from '../../common/dto/api-response.dto';

const pageContentService = new PageContentService();

/**
 * @swagger
 * tags:
 *   name: PageContents
 *   description: Static page content management
 */

export async function listPages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { pages, meta } = await pageContentService.findAll(req.query as any);
    res.json(successResponse(pages, undefined, meta));
  } catch (error) { next(error); }
}

export async function getPageBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageContentService.findBySlug(req.params.slug);
    res.json(successResponse(page));
  } catch (error) { next(error); }
}

export async function getPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageContentService.findById(req.params.id);
    res.json(successResponse(page));
  } catch (error) { next(error); }
}

export async function createPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageContentService.create(req.body);
    res.status(201).json(successResponse(page, 'Page created'));
  } catch (error) { next(error); }
}

export async function updatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageContentService.update(req.params.id, req.body);
    res.json(successResponse(page, 'Page updated'));
  } catch (error) { next(error); }
}

export async function deletePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await pageContentService.delete(req.params.id);
    res.json(successResponse(null, 'Page deleted'));
  } catch (error) { next(error); }
}
