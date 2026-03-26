import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from './enrollment.service';
import { successResponse } from '../../common/dto/api-response.dto';

const enrollmentService = new EnrollmentService();

export const listEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await enrollmentService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await enrollmentService.findMyEnrollments(req.user!.id, req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await enrollmentService.findById(req.params.id);
    res.json(successResponse(enrollment));
  } catch (error) { next(error); }
};

export const enroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await enrollmentService.enroll(req.user!.id, req.body);
    res.status(201).json(successResponse(result, 'Enrolled successfully'));
  } catch (error) { next(error); }
};

export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await enrollmentService.updateProgress(req.params.id, req.user!.id);
    res.json(successResponse(enrollment, 'Progress updated'));
  } catch (error) { next(error); }
};
