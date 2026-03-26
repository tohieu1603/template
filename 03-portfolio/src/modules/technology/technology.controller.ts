import { Request, Response, NextFunction } from 'express';
import { TechnologyService } from './technology.service';
import { successResponse } from '../../common/dto/api-response.dto';

const technologyService = new TechnologyService();

/**
 * @swagger
 * tags:
 *   name: Technologies
 *   description: Technology tag management
 */

export async function listTechnologies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await technologyService.findAll(req.query as any);
    res.json(successResponse(result.technologies, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getTechnology(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tech = await technologyService.findById(req.params.id);
    res.json(successResponse(tech));
  } catch (error) { next(error); }
}

export async function createTechnology(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tech = await technologyService.create(req.body);
    res.status(201).json(successResponse(tech, 'Technology created'));
  } catch (error) { next(error); }
}

export async function updateTechnology(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tech = await technologyService.update(req.params.id, req.body);
    res.json(successResponse(tech, 'Technology updated'));
  } catch (error) { next(error); }
}

export async function deleteTechnology(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await technologyService.delete(req.params.id);
    res.json(successResponse(null, 'Technology deleted'));
  } catch (error) { next(error); }
}
