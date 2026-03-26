import { Request, Response, NextFunction } from 'express';
import { TagService } from './tag.service';
import { successResponse } from '../../common/dto/api-response.dto';

const tagService = new TagService();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Blog tag management
 */

export async function listTags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tags, meta } = await tagService.findAll(req.query as any);
    res.json(successResponse(tags, undefined, meta));
  } catch (error) { next(error); }
}

export async function getTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await tagService.findById(req.params.id);
    res.json(successResponse(tag));
  } catch (error) { next(error); }
}

export async function getTagBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await tagService.findBySlug(req.params.slug);
    res.json(successResponse(tag));
  } catch (error) { next(error); }
}

export async function createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await tagService.create(req.body);
    res.status(201).json(successResponse(tag, 'Tag created'));
  } catch (error) { next(error); }
}

export async function updateTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await tagService.update(req.params.id, req.body);
    res.json(successResponse(tag, 'Tag updated'));
  } catch (error) { next(error); }
}

export async function deleteTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await tagService.delete(req.params.id);
    res.json(successResponse(null, 'Tag deleted'));
  } catch (error) { next(error); }
}
