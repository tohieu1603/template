import { Request, Response, NextFunction } from 'express';
import { TestimonialService } from './testimonial.service';
import { successResponse } from '../../common/dto/api-response.dto';

const testimonialService = new TestimonialService();

/**
 * @swagger
 * tags:
 *   name: Testimonials
 *   description: Client testimonials management
 */

export async function listTestimonials(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await testimonialService.findAll(req.query as any);
    res.json(successResponse(result.testimonials, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const t = await testimonialService.findById(req.params.id);
    res.json(successResponse(t));
  } catch (error) { next(error); }
}

export async function createTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const t = await testimonialService.create(req.body);
    res.status(201).json(successResponse(t, 'Testimonial created'));
  } catch (error) { next(error); }
}

export async function updateTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const t = await testimonialService.update(req.params.id, req.body);
    res.json(successResponse(t, 'Testimonial updated'));
  } catch (error) { next(error); }
}

export async function deleteTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await testimonialService.delete(req.params.id);
    res.json(successResponse(null, 'Testimonial deleted'));
  } catch (error) { next(error); }
}
