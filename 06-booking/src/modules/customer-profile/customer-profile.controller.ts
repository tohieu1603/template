import { Request, Response, NextFunction } from 'express';
import { CustomerProfileService } from './customer-profile.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new CustomerProfileService();

/**
 * @swagger
 * tags:
 *   name: CustomerProfiles
 *   description: Customer profile management
 */

export async function listProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.findByUserId(req.user!.id);
    res.json(successResponse(item));
  } catch (error) { next(error); }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.findById(req.params.id);
    res.json(successResponse(item));
  } catch (error) { next(error); }
}

export async function createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.create(req.user!.id, req.body);
    res.status(201).json(successResponse(item, 'Profile created'));
  } catch (error) { next(error); }
}

export async function updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.upsertForUser(req.user!.id, req.body);
    res.json(successResponse(item, 'Profile updated'));
  } catch (error) { next(error); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json(successResponse(item, 'Profile updated'));
  } catch (error) { next(error); }
}

export async function deleteProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Profile deleted'));
  } catch (error) { next(error); }
}
