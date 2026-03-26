import { Request, Response, NextFunction } from 'express';
import { InstructorService } from './instructor.service';
import { successResponse } from '../../common/dto/api-response.dto';

const instructorService = new InstructorService();

export const listInstructors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await instructorService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const param = req.params.slug;
    const instructor = UUID_REGEX.test(param)
      ? await instructorService.findById(param)
      : await instructorService.findBySlug(param);
    res.json(successResponse(instructor));
  } catch (error) { next(error); }
};

export const createInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructor = await instructorService.create(req.body);
    res.status(201).json(successResponse(instructor, 'Instructor created'));
  } catch (error) { next(error); }
};

export const updateInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructor = await instructorService.update(req.params.id, req.body);
    res.json(successResponse(instructor, 'Instructor updated'));
  } catch (error) { next(error); }
};

export const verifyInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructor = await instructorService.verify(req.params.id, req.body.isVerified ?? true);
    res.json(successResponse(instructor, 'Instructor verification updated'));
  } catch (error) { next(error); }
};

export const deleteInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await instructorService.delete(req.params.id);
    res.json(successResponse(null, 'Instructor deleted'));
  } catch (error) { next(error); }
};
