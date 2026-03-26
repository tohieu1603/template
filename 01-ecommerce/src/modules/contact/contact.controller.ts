import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';
import { successResponse } from '../../common/dto/api-response.dto';

const contactService = new ContactService();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact form submissions
 */

export async function listContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { contacts, meta } = await contactService.findAll(req.query as any);
    res.json(successResponse(contacts, undefined, meta));
  } catch (error) { next(error); }
}

export async function getContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactService.findById(req.params.id);
    res.json(successResponse(contact));
  } catch (error) { next(error); }
}

export async function submitContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactService.submit(req.body);
    res.status(201).json(successResponse(contact, 'Message sent successfully'));
  } catch (error) { next(error); }
}

export async function markContactRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactService.markAsRead(req.params.id);
    res.json(successResponse(contact, 'Marked as read'));
  } catch (error) { next(error); }
}

export async function deleteContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await contactService.delete(req.params.id);
    res.json(successResponse(null, 'Contact deleted'));
  } catch (error) { next(error); }
}
