import { Request, Response, NextFunction } from 'express';
import { TableService } from './table.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new TableService();

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Restaurant table management
 */

export const listTables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.tables, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await service.findById(req.params.id);
    res.json(successResponse(table));
  } catch (e) { next(e); }
};

export const createTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await service.create(req.body);
    res.status(201).json(successResponse(table, 'Table created'));
  } catch (e) { next(e); }
};

export const updateTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await service.update(req.params.id, req.body);
    res.json(successResponse(table, 'Table updated'));
  } catch (e) { next(e); }
};

export const updateTableStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await service.updateStatus(req.params.id, req.body);
    res.json(successResponse(table, 'Table status updated'));
  } catch (e) { next(e); }
};

export const deleteTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Table deleted'));
  } catch (e) { next(e); }
};
