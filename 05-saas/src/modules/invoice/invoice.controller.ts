import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from './invoice.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new InvoiceService();

export const listInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.params.orgId, req.query as any);
    res.json(successResponse(result.invoices, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await service.findById(req.params.id, req.params.orgId);
    res.json(successResponse(invoice));
  } catch (e) { next(e); }
};

export const markPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await service.markPaid(req.params.id, req.params.orgId, req.body);
    res.json(successResponse(invoice, 'Invoice marked as paid'));
  } catch (e) { next(e); }
};
