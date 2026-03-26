import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ContactService();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact form submissions
 */

export const listContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.contacts, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await service.findById(req.params.id);
    res.json(successResponse(c));
  } catch (e) { next(e); }
};

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await service.create(req.body);
    res.status(201).json(successResponse(c, 'Message sent successfully'));
  } catch (e) { next(e); }
};

export const markContactRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await service.markRead(req.params.id);
    res.json(successResponse(c, 'Marked as read'));
  } catch (e) { next(e); }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Contact deleted'));
  } catch (e) { next(e); }
};
