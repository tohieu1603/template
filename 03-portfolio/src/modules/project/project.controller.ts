import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service';
import { successResponse } from '../../common/dto/api-response.dto';

const projectService = new ProjectService();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Portfolio project management
 */

export async function listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await projectService.findAll(req.query as any);
    res.json(successResponse(result.projects, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getProjectBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectService.findBySlug(req.params.slug);
    await projectService.incrementViewCount(project.id);
    res.json(successResponse(project));
  } catch (error) { next(error); }
}

export async function getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectService.findById(req.params.id);
    res.json(successResponse(project));
  } catch (error) { next(error); }
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectService.create(req.body);
    res.status(201).json(successResponse(project, 'Project created'));
  } catch (error) { next(error); }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectService.update(req.params.id, req.body);
    res.json(successResponse(project, 'Project updated'));
  } catch (error) { next(error); }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await projectService.delete(req.params.id);
    res.json(successResponse(null, 'Project deleted'));
  } catch (error) { next(error); }
}

export async function addProjectImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const image = await projectService.addImage(req.body);
    res.status(201).json(successResponse(image, 'Image added'));
  } catch (error) { next(error); }
}

export async function deleteProjectImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await projectService.deleteImage(req.params.imageId);
    res.json(successResponse(null, 'Image deleted'));
  } catch (error) { next(error); }
}
