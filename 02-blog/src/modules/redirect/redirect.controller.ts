import { Request, Response, NextFunction } from 'express';
import { RedirectService } from './redirect.service';
import { successResponse } from '../../common/dto/api-response.dto';

const redirectService = new RedirectService();

/**
 * @swagger
 * tags:
 *   name: Redirects
 *   description: URL redirect management
 */

export async function listRedirects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { redirects, meta } = await redirectService.findAll(req.query as any);
    res.json(successResponse(redirects, undefined, meta));
  } catch (error) { next(error); }
}

export async function getRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const redirect = await redirectService.findById(req.params.id);
    res.json(successResponse(redirect));
  } catch (error) { next(error); }
}

export async function createRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const redirect = await redirectService.create(req.body);
    res.status(201).json(successResponse(redirect, 'Redirect created'));
  } catch (error) { next(error); }
}

export async function updateRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const redirect = await redirectService.update(req.params.id, req.body);
    res.json(successResponse(redirect, 'Redirect updated'));
  } catch (error) { next(error); }
}

export async function deleteRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await redirectService.delete(req.params.id);
    res.json(successResponse(null, 'Redirect deleted'));
  } catch (error) { next(error); }
}
