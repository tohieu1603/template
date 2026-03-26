import { Request, Response, NextFunction } from 'express';
import { SettingService } from './setting.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new SettingService();

export const listSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.settings, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await service.findByKey(req.params.key);
    res.json(successResponse(setting));
  } catch (e) { next(e); }
};

export const createSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await service.create(req.body);
    res.status(201).json(successResponse(setting, 'Setting created'));
  } catch (e) { next(e); }
};

export const updateSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await service.update(req.params.key, req.body);
    res.json(successResponse(setting, 'Setting updated'));
  } catch (e) { next(e); }
};

export const bulkUpdateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.bulkUpdate(req.body);
    res.json(successResponse(null, 'Settings updated'));
  } catch (e) { next(e); }
};

export const deleteSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.key);
    res.json(successResponse(null, 'Setting deleted'));
  } catch (e) { next(e); }
};
