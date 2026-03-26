import { Request, Response, NextFunction } from 'express';
import { CourseSectionService } from './course-section.service';
import { successResponse } from '../../common/dto/api-response.dto';

const courseSectionService = new CourseSectionService();

export const listSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await courseSectionService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getSectionsByCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sections = await courseSectionService.findByCourse(req.params.courseId);
    res.json(successResponse(sections));
  } catch (error) { next(error); }
};

export const getSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = await courseSectionService.findById(req.params.id);
    res.json(successResponse(section));
  } catch (error) { next(error); }
};

export const createSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = await courseSectionService.create(req.body);
    res.status(201).json(successResponse(section, 'Section created'));
  } catch (error) { next(error); }
};

export const updateSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const section = await courseSectionService.update(req.params.id, req.body);
    res.json(successResponse(section, 'Section updated'));
  } catch (error) { next(error); }
};

export const deleteSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await courseSectionService.delete(req.params.id);
    res.json(successResponse(null, 'Section deleted'));
  } catch (error) { next(error); }
};
