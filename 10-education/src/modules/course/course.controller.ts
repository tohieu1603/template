import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { successResponse } from '../../common/dto/api-response.dto';

const courseService = new CourseService();

export const listCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await courseService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const param = req.params.slug;
    // If param looks like a UUID, try findById first
    const course = UUID_REGEX.test(param)
      ? await courseService.findById(param)
      : await courseService.findBySlug(param);
    res.json(successResponse(course));
  } catch (error) { next(error); }
};

export const getCourseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.findById(req.params.id);
    res.json(successResponse(course));
  } catch (error) { next(error); }
};

export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.create(req.body);
    res.status(201).json(successResponse(course, 'Course created'));
  } catch (error) { next(error); }
};

export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.update(req.params.id, req.body);
    res.json(successResponse(course, 'Course updated'));
  } catch (error) { next(error); }
};

export const publishCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.publish(req.params.id);
    res.json(successResponse(course, 'Course published'));
  } catch (error) { next(error); }
};

export const unpublishCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.unpublish(req.params.id);
    res.json(successResponse(course, 'Course unpublished'));
  } catch (error) { next(error); }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await courseService.delete(req.params.id);
    res.json(successResponse(null, 'Course deleted'));
  } catch (error) { next(error); }
};
