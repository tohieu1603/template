import { Request, Response, NextFunction } from 'express';
import { OperatingHoursService } from './operating-hours.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new OperatingHoursService();

/**
 * @swagger
 * tags:
 *   name: OperatingHours
 *   description: Restaurant operating hours
 */

export const listHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hours = await service.findAll();
    res.json(successResponse(hours));
  } catch (e) { next(e); }
};

export const getHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const h = await service.findById(req.params.id);
    res.json(successResponse(h));
  } catch (e) { next(e); }
};

export const createHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const h = await service.create(req.body);
    res.status(201).json(successResponse(h, 'Operating hours created'));
  } catch (e) { next(e); }
};

export const updateHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const h = await service.update(req.params.id, req.body);
    res.json(successResponse(h, 'Operating hours updated'));
  } catch (e) { next(e); }
};

export const deleteHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Operating hours deleted'));
  } catch (e) { next(e); }
};
