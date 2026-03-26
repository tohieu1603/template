import { Request, Response, NextFunction } from 'express';
import { SettingService } from './setting.service';
import { successResponse } from '../../common/dto/api-response.dto';

const settingService = new SettingService();

export const listSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await settingService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await settingService.findByKey(req.params.key);
    res.json(successResponse(setting));
  } catch (error) { next(error); }
};

export const createSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await settingService.create(req.body);
    res.status(201).json(successResponse(setting, 'Setting created'));
  } catch (error) { next(error); }
};

export const updateSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await settingService.update(req.params.key, req.body);
    res.json(successResponse(setting, 'Setting updated'));
  } catch (error) { next(error); }
};

export const deleteSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await settingService.delete(req.params.key);
    res.json(successResponse(null, 'Setting deleted'));
  } catch (error) { next(error); }
};
