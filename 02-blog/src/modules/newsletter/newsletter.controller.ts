import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from './newsletter.service';
import { successResponse } from '../../common/dto/api-response.dto';

const newsletterService = new NewsletterService();

/**
 * @swagger
 * tags:
 *   name: Newsletter
 *   description: Newsletter subscription management
 */

export async function listSubscribers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { subscribers, meta } = await newsletterService.findAll(req.query as any);
    res.json(successResponse(subscribers, undefined, meta));
  } catch (error) { next(error); }
}

export async function subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscriber = await newsletterService.subscribe(req.body);
    res.status(201).json(successResponse(subscriber, 'Successfully subscribed'));
  } catch (error) { next(error); }
}

export async function unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await newsletterService.unsubscribe(req.body);
    res.json(successResponse(null, 'Successfully unsubscribed'));
  } catch (error) { next(error); }
}

export async function deleteSubscriber(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await newsletterService.delete(req.params.id);
    res.json(successResponse(null, 'Subscriber deleted'));
  } catch (error) { next(error); }
}
