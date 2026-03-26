import { Request, Response, NextFunction } from 'express';
import { MenuItemService } from './menu-item.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new MenuItemService();

/**
 * @swagger
 * tags:
 *   name: MenuItems
 *   description: Menu item management
 */

export const listItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.findByIdWithOptions(req.params.id);
    res.json(successResponse(item));
  } catch (e) { next(e); }
};

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.create(req.body);
    res.status(201).json(successResponse(item, 'Menu item created'));
  } catch (e) { next(e); }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json(successResponse(item, 'Menu item updated'));
  } catch (e) { next(e); }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Menu item deleted'));
  } catch (e) { next(e); }
};

export const addOption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const option = await service.addOption(req.params.id, req.body);
    res.status(201).json(successResponse(option, 'Option added'));
  } catch (e) { next(e); }
};

export const deleteOption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.deleteOption(req.params.id, req.params.optId);
    res.json(successResponse(null, 'Option deleted'));
  } catch (e) { next(e); }
};

export const addOptionValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = await service.addOptionValue(req.params.id, req.params.optId, req.body);
    res.status(201).json(successResponse(value, 'Option value added'));
  } catch (e) { next(e); }
};

export const deleteOptionValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.deleteOptionValue(req.params.optId, req.params.valueId);
    res.json(successResponse(null, 'Option value deleted'));
  } catch (e) { next(e); }
};
