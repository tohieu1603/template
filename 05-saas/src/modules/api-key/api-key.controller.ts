import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from './api-key.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ApiKeyService();

export const listApiKeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.params.orgId, req.query as any);
    res.json(successResponse(result.keys, undefined, result.meta));
  } catch (e) { next(e); }
};

export const createApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.create(req.params.orgId, req.body, req.user!.id);
    res.status(201).json(successResponse(result, 'API key created. Store the raw key safely — it will not be shown again.'));
  } catch (e) { next(e); }
};

export const revokeApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.revoke(req.params.id, req.params.orgId);
    res.json(successResponse(null, 'API key revoked'));
  } catch (e) { next(e); }
};

export const rotateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.rotate(req.params.id, req.params.orgId);
    res.json(successResponse(result, 'API key rotated'));
  } catch (e) { next(e); }
};
