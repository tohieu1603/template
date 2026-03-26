import { Request, Response, NextFunction } from 'express';
import { SkillService } from './skill.service';
import { successResponse } from '../../common/dto/api-response.dto';

const skillService = new SkillService();

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: Skill management
 */

export async function listSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await skillService.findAll(req.query as any);
    res.json(successResponse(result.skills, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const skill = await skillService.findById(req.params.id);
    res.json(successResponse(skill));
  } catch (error) { next(error); }
}

export async function createSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const skill = await skillService.create(req.body);
    res.status(201).json(successResponse(skill, 'Skill created'));
  } catch (error) { next(error); }
}

export async function updateSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const skill = await skillService.update(req.params.id, req.body);
    res.json(successResponse(skill, 'Skill updated'));
  } catch (error) { next(error); }
}

export async function deleteSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await skillService.delete(req.params.id);
    res.json(successResponse(null, 'Skill deleted'));
  } catch (error) { next(error); }
}
