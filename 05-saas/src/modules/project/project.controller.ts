import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ProjectService();

export const listProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.params.orgId, req.query as any);
    res.json(successResponse(result.projects, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await service.findById(req.params.id, req.params.orgId);
    res.json(successResponse(p));
  } catch (e) { next(e); }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await service.create(req.params.orgId, req.body, req.user!.id);
    res.status(201).json(successResponse(p, 'Project created'));
  } catch (e) { next(e); }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await service.update(req.params.id, req.params.orgId, req.body);
    res.json(successResponse(p, 'Project updated'));
  } catch (e) { next(e); }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id, req.params.orgId);
    res.json(successResponse(null, 'Project deleted'));
  } catch (e) { next(e); }
};
