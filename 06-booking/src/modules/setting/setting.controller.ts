import { Request, Response, NextFunction } from 'express';
import { SettingService } from './setting.service';
import { successResponse } from '../../common/dto/api-response.dto';

const settingService = new SettingService();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Application settings management
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: List all settings
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupName
 *         schema: { type: string }
 *     responses:
 *       200: { description: Settings list }
 */
export async function listSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await settingService.findAll(req.query as any);
    res.json(successResponse(result.settings, undefined, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function getSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const setting = await settingService.findById(req.params.id);
    res.json(successResponse(setting));
  } catch (error) {
    next(error);
  }
}

export async function createSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const setting = await settingService.create(req.body);
    res.status(201).json(successResponse(setting, 'Setting created'));
  } catch (error) {
    next(error);
  }
}

export async function updateSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const setting = await settingService.update(req.params.id, req.body);
    res.json(successResponse(setting, 'Setting updated'));
  } catch (error) {
    next(error);
  }
}

export async function deleteSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await settingService.delete(req.params.id);
    res.json(successResponse(null, 'Setting deleted'));
  } catch (error) {
    next(error);
  }
}
