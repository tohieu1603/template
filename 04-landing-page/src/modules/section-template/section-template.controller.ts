import { Request, Response, NextFunction } from 'express';
import { SectionTemplateService } from './section-template.service';
import { successResponse } from '../../common/dto/api-response.dto';

const sectionTemplateService = new SectionTemplateService();

/**
 * @swagger
 * tags:
 *   name: SectionTemplates
 *   description: Section template library
 */

export async function listTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await sectionTemplateService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const template = await sectionTemplateService.findOne(req.params.id);
    res.json(successResponse(template));
  } catch (error) { next(error); }
}

export async function createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const template = await sectionTemplateService.create(req.body);
    res.status(201).json(successResponse(template, 'Template created'));
  } catch (error) { next(error); }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const template = await sectionTemplateService.update(req.params.id, req.body);
    res.json(successResponse(template, 'Template updated'));
  } catch (error) { next(error); }
}

export async function deleteTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await sectionTemplateService.remove(req.params.id);
    res.json(successResponse(null, 'Template deleted'));
  } catch (error) { next(error); }
}
