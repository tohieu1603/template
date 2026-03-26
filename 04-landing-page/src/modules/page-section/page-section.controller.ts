import { Request, Response, NextFunction } from 'express';
import { PageSectionService } from './page-section.service';
import { successResponse } from '../../common/dto/api-response.dto';

const pageSectionService = new PageSectionService();

/**
 * @swagger
 * tags:
 *   name: PageSections
 *   description: Page section management
 */

export async function listSectionsByPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sections = await pageSectionService.findByPage(req.params.pageId);
    res.json(successResponse(sections));
  } catch (error) { next(error); }
}

export async function getSection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const section = await pageSectionService.findOne(req.params.id);
    res.json(successResponse(section));
  } catch (error) { next(error); }
}

export async function createSection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const section = await pageSectionService.create(req.body);
    res.status(201).json(successResponse(section, 'Section created'));
  } catch (error) { next(error); }
}

export async function updateSection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const section = await pageSectionService.update(req.params.id, req.body);
    res.json(successResponse(section, 'Section updated'));
  } catch (error) { next(error); }
}

export async function toggleSectionVisibility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const section = await pageSectionService.toggleVisibility(req.params.id);
    res.json(successResponse(section, 'Visibility toggled'));
  } catch (error) { next(error); }
}

export async function reorderSections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await pageSectionService.reorder(req.body);
    res.json(successResponse(result, 'Sections reordered'));
  } catch (error) { next(error); }
}

export async function deleteSection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await pageSectionService.remove(req.params.id);
    res.json(successResponse(null, 'Section deleted'));
  } catch (error) { next(error); }
}
