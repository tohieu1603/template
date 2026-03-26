import { Request, Response, NextFunction } from 'express';
import { FormSubmissionService } from './form-submission.service';
import { FormService } from '../form/form.service';
import { successResponse } from '../../common/dto/api-response.dto';

const formSubmissionService = new FormSubmissionService();
const formService = new FormService();

/**
 * @swagger
 * tags:
 *   name: FormSubmissions
 *   description: Form submission management
 */

export async function listSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await formSubmissionService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const submission = await formSubmissionService.findOne(req.params.id);
    res.json(successResponse(submission));
  } catch (error) { next(error); }
}

export async function submitForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ip = req.ip ?? '';
    const userAgent = req.get('user-agent') ?? '';
    const submission = await formSubmissionService.create(req.body, ip, userAgent);
    // Increment form submission count
    await formService.incrementSubmissionCount(req.body.formId).catch(() => {});
    res.status(201).json(successResponse(submission, 'Form submitted successfully'));
  } catch (error) { next(error); }
}

export async function markSubmissionRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const submission = await formSubmissionService.markRead(req.params.id);
    res.json(successResponse(submission, 'Marked as read'));
  } catch (error) { next(error); }
}

export async function deleteSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await formSubmissionService.remove(req.params.id);
    res.json(successResponse(null, 'Submission deleted'));
  } catch (error) { next(error); }
}
