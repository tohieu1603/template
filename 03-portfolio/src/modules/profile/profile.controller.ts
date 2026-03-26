import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { successResponse } from '../../common/dto/api-response.dto';

const profileService = new ProfileService();

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Portfolio profile management
 */

export async function listProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await profileService.findAll(req.query as any);
    res.json(successResponse(result.profiles, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getProfileBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await profileService.findBySlug(req.params.slug);
    res.json(successResponse(profile));
  } catch (error) { next(error); }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await profileService.findById(req.params.id);
    res.json(successResponse(profile));
  } catch (error) { next(error); }
}

export async function createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await profileService.create(req.body);
    res.status(201).json(successResponse(profile, 'Profile created'));
  } catch (error) { next(error); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await profileService.update(req.params.id, req.body);
    res.json(successResponse(profile, 'Profile updated'));
  } catch (error) { next(error); }
}

export async function deleteProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await profileService.delete(req.params.id);
    res.json(successResponse(null, 'Profile deleted'));
  } catch (error) { next(error); }
}
