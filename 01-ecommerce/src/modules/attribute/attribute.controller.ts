import { Request, Response, NextFunction } from 'express';
import { AttributeService } from './attribute.service';
import { successResponse } from '../../common/dto/api-response.dto';

const attributeService = new AttributeService();

/**
 * @swagger
 * tags:
 *   name: Attributes
 *   description: Product attribute management
 */

export async function listAttributes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { attributes, meta } = await attributeService.findAll(req.query as any);
    res.json(successResponse(attributes, undefined, meta));
  } catch (error) { next(error); }
}

export async function getAttribute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const attribute = await attributeService.findById(req.params.id);
    res.json(successResponse(attribute));
  } catch (error) { next(error); }
}

export async function createAttribute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const attribute = await attributeService.create(req.body);
    res.status(201).json(successResponse(attribute, 'Attribute created'));
  } catch (error) { next(error); }
}

export async function updateAttribute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const attribute = await attributeService.update(req.params.id, req.body);
    res.json(successResponse(attribute, 'Attribute updated'));
  } catch (error) { next(error); }
}

export async function deleteAttribute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await attributeService.delete(req.params.id);
    res.json(successResponse(null, 'Attribute deleted'));
  } catch (error) { next(error); }
}

export async function addAttributeValue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const value = await attributeService.addValue(req.params.id, req.body);
    res.status(201).json(successResponse(value, 'Value added'));
  } catch (error) { next(error); }
}

export async function deleteAttributeValue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await attributeService.deleteValue(req.params.valueId);
    res.json(successResponse(null, 'Value deleted'));
  } catch (error) { next(error); }
}
