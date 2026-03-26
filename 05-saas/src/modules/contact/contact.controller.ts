import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ContactService();

export const listContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.submissions, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await service.findById(req.params.id);
    res.json(successResponse(contact));
  } catch (e) { next(e); }
};

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await service.create(req.body);
    res.status(201).json(successResponse(contact, 'Message sent successfully'));
  } catch (e) { next(e); }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await service.update(req.params.id, req.body);
    res.json(successResponse(contact, 'Contact updated'));
  } catch (e) { next(e); }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Contact deleted'));
  } catch (e) { next(e); }
};
