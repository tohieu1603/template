import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';
import { successResponse } from '../../common/dto/api-response.dto';

const contactService = new ContactService();

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact form submissions
 */

export async function listContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await contactService.findAll(req.query as any);
    res.json(successResponse(result.contacts, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactService.findById(req.params.id);
    res.json(successResponse(contact));
  } catch (error) { next(error); }
}

export async function createContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactService.create(req.body, req.ip ?? '');
    res.status(201).json(successResponse(contact, 'Message sent successfully'));
  } catch (error) { next(error); }
}

export async function updateContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactService.update(req.params.id, req.body);
    res.json(successResponse(contact, 'Contact updated'));
  } catch (error) { next(error); }
}

export async function deleteContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await contactService.delete(req.params.id);
    res.json(successResponse(null, 'Contact deleted'));
  } catch (error) { next(error); }
}
