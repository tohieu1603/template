import { Request, Response, NextFunction } from 'express';
import { FeatureService } from './feature.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new FeatureService();

export const listFeatures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.features, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const f = await service.findById(req.params.id);
    res.json(successResponse(f));
  } catch (e) { next(e); }
};

export const createFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const f = await service.create(req.body);
    res.status(201).json(successResponse(f, 'Feature created'));
  } catch (e) { next(e); }
};

export const updateFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const f = await service.update(req.params.id, req.body);
    res.json(successResponse(f, 'Feature updated'));
  } catch (e) { next(e); }
};

export const deleteFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Feature deleted'));
  } catch (e) { next(e); }
};

export const getOrgFeatures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const features = await service.getOrgFeatures(req.params.orgId);
    res.json(successResponse(features));
  } catch (e) { next(e); }
};

export const setOrgFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const f = await service.setOrgFeature(req.params.orgId, req.body);
    res.json(successResponse(f, 'Feature override set'));
  } catch (e) { next(e); }
};
