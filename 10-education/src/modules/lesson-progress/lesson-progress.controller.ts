import { Request, Response, NextFunction } from 'express';
import { LessonProgressService } from './lesson-progress.service';
import { successResponse } from '../../common/dto/api-response.dto';

const lessonProgressService = new LessonProgressService();

export const getProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const progress = await lessonProgressService.getProgress(req.params.enrollmentId, req.user!.id);
    res.json(successResponse(progress));
  } catch (error) { next(error); }
};

export const markComplete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enrollmentId, lessonId } = req.body;
    const progress = await lessonProgressService.markComplete(enrollmentId, lessonId, req.user!.id);
    res.json(successResponse(progress, 'Lesson marked as complete'));
  } catch (error) { next(error); }
};

export const updateWatchTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enrollmentId, lessonId, watchTimeSeconds } = req.body;
    const progress = await lessonProgressService.updateWatchTime(enrollmentId, lessonId, req.user!.id, watchTimeSeconds);
    res.json(successResponse(progress, 'Watch time updated'));
  } catch (error) { next(error); }
};
