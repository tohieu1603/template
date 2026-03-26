import { Request, Response, NextFunction } from 'express';
import { LessonService } from './lesson.service';
import { successResponse } from '../../common/dto/api-response.dto';

const lessonService = new LessonService();

export const listLessons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await lessonService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await lessonService.findById(req.params.id);
    res.json(successResponse(lesson));
  } catch (error) { next(error); }
};

export const createLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await lessonService.create(req.body);
    res.status(201).json(successResponse(lesson, 'Lesson created'));
  } catch (error) { next(error); }
};

export const updateLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await lessonService.update(req.params.id, req.body);
    res.json(successResponse(lesson, 'Lesson updated'));
  } catch (error) { next(error); }
};

export const deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await lessonService.delete(req.params.id);
    res.json(successResponse(null, 'Lesson deleted'));
  } catch (error) { next(error); }
};
