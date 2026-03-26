import { Request, Response, NextFunction } from 'express';
import { PageService } from './page.service';
import { successResponse } from '../../common/dto/api-response.dto';

const pageService = new PageService();

/**
 * @swagger
 * tags:
 *   name: Pages
 *   description: Landing page management
 */

export async function listPages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await pageService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageService.findOne(req.params.id);
    res.json(successResponse(page));
  } catch (error) { next(error); }
}

export async function getPageBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageService.findBySlug(req.params.slug);
    res.json(successResponse(page));
  } catch (error) { next(error); }
}

export async function createPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageService.create(req.body, req.user!.id);
    res.status(201).json(successResponse(page, 'Page created'));
  } catch (error) { next(error); }
}

export async function updatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageService.update(req.params.id, req.body);
    res.json(successResponse(page, 'Page updated'));
  } catch (error) { next(error); }
}

export async function publishPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageService.publish(req.params.id);
    res.json(successResponse(page, 'Page published'));
  } catch (error) { next(error); }
}

export async function unpublishPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageService.unpublish(req.params.id);
    res.json(successResponse(page, 'Page unpublished'));
  } catch (error) { next(error); }
}

export async function duplicatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await pageService.duplicate(req.params.id, req.user!.id);
    res.status(201).json(successResponse(page, 'Page duplicated'));
  } catch (error) { next(error); }
}

export async function deletePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await pageService.remove(req.params.id);
    res.json(successResponse(null, 'Page deleted'));
  } catch (error) { next(error); }
}
