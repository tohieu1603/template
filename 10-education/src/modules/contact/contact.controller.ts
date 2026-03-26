import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';
import { successResponse } from '../../common/dto/api-response.dto';

const contactService = new ContactService();

export const listContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contactService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.findById(req.params.id);
    res.json(successResponse(contact));
  } catch (error) { next(error); }
};

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.create(req.body);
    res.status(201).json(successResponse(contact, 'Message sent successfully'));
  } catch (error) { next(error); }
};

export const replyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.reply(req.params.id, req.body.adminReply);
    res.json(successResponse(contact, 'Reply sent'));
  } catch (error) { next(error); }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contactService.delete(req.params.id);
    res.json(successResponse(null, 'Contact deleted'));
  } catch (error) { next(error); }
};
