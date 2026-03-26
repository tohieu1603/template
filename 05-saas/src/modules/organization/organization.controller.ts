import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './organization.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new OrganizationService();

export const listOrganizations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.orgs, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await service.findById(req.params.id);
    res.json(successResponse(org));
  } catch (e) { next(e); }
};

export const createOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await service.create(req.body, req.user!.id);
    res.status(201).json(successResponse(org, 'Organization created'));
  } catch (e) { next(e); }
};

export const updateOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await service.update(req.params.id, req.body, req.user!.id);
    res.json(successResponse(org, 'Organization updated'));
  } catch (e) { next(e); }
};

export const deleteOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Organization deleted'));
  } catch (e) { next(e); }
};

export const getMyOrganizations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgs = await service.getUserOrganizations(req.user!.id);
    res.json(successResponse(orgs));
  } catch (e) { next(e); }
};
