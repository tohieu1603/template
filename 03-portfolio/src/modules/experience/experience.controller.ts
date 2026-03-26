import { Request, Response, NextFunction } from 'express';
import { ExperienceService } from './experience.service';
import { successResponse } from '../../common/dto/api-response.dto';

const experienceService = new ExperienceService();

/**
 * @swagger
 * tags:
 *   name: Experiences
 *   description: Work/education experience management
 */

export async function listExperiences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await experienceService.findAll(req.query as any);
    res.json(successResponse(result.experiences, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exp = await experienceService.findById(req.params.id);
    res.json(successResponse(exp));
  } catch (error) { next(error); }
}

export async function createExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exp = await experienceService.create(req.body);
    res.status(201).json(successResponse(exp, 'Experience created'));
  } catch (error) { next(error); }
}

export async function updateExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exp = await experienceService.update(req.params.id, req.body);
    res.json(successResponse(exp, 'Experience updated'));
  } catch (error) { next(error); }
}

export async function deleteExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await experienceService.delete(req.params.id);
    res.json(successResponse(null, 'Experience deleted'));
  } catch (error) { next(error); }
}
