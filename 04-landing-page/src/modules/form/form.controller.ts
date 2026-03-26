import { Request, Response, NextFunction } from 'express';
import { FormService } from './form.service';
import { successResponse } from '../../common/dto/api-response.dto';

const formService = new FormService();

/**
 * @swagger
 * tags:
 *   name: Forms
 *   description: Dynamic form builder
 */

export async function listForms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await formService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const form = await formService.findOne(req.params.id);
    res.json(successResponse(form));
  } catch (error) { next(error); }
}

export async function getFormBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const form = await formService.findBySlug(req.params.slug);
    res.json(successResponse(form));
  } catch (error) { next(error); }
}

export async function createForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const form = await formService.create(req.body);
    res.status(201).json(successResponse(form, 'Form created'));
  } catch (error) { next(error); }
}

export async function updateForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const form = await formService.update(req.params.id, req.body);
    res.json(successResponse(form, 'Form updated'));
  } catch (error) { next(error); }
}

export async function deleteForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await formService.remove(req.params.id);
    res.json(successResponse(null, 'Form deleted'));
  } catch (error) { next(error); }
}
