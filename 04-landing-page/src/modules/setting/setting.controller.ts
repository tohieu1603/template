import { Request, Response, NextFunction } from 'express';
import { SettingService } from './setting.service';
import { successResponse } from '../../common/dto/api-response.dto';

const settingService = new SettingService();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Site configuration management
 */

export async function listSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await settingService.findAll(req.query.group as string);
    res.json(successResponse(settings));
  } catch (error) { next(error); }
}

export async function getSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const setting = await settingService.findByKey(req.params.key);
    res.json(successResponse(setting));
  } catch (error) { next(error); }
}

export async function upsertSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const setting = await settingService.upsert(req.body);
    res.json(successResponse(setting, 'Setting saved'));
  } catch (error) { next(error); }
}

export async function deleteSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await settingService.remove(req.params.key);
    res.json(successResponse(null, 'Setting deleted'));
  } catch (error) { next(error); }
}
