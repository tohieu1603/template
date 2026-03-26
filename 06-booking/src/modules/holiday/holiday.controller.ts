import { Request, Response, NextFunction } from 'express';
import { HolidayService } from './holiday.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new HolidayService();

/**
 * @swagger
 * tags:
 *   name: Holidays
 *   description: Holiday and closure management
 */

export async function listHolidays(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getHoliday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.findById(req.params.id);
    res.json(successResponse(item));
  } catch (error) { next(error); }
}

export async function createHoliday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.create(req.body, req.user!.id);
    res.status(201).json(successResponse(item, 'Holiday created'));
  } catch (error) { next(error); }
}

export async function updateHoliday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json(successResponse(item, 'Holiday updated'));
  } catch (error) { next(error); }
}

export async function deleteHoliday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Holiday deleted'));
  } catch (error) { next(error); }
}
