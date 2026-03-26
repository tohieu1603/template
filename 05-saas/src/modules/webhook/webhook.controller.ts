import { Request, Response, NextFunction } from 'express';
import { WebhookService } from './webhook.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new WebhookService();

export const listWebhooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.params.orgId, req.query as any);
    res.json(successResponse(result.webhooks, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const w = await service.findById(req.params.id, req.params.orgId);
    res.json(successResponse(w));
  } catch (e) { next(e); }
};

export const createWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const w = await service.create(req.params.orgId, req.body);
    res.status(201).json(successResponse(w, 'Webhook created'));
  } catch (e) { next(e); }
};

export const updateWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const w = await service.update(req.params.id, req.params.orgId, req.body);
    res.json(successResponse(w, 'Webhook updated'));
  } catch (e) { next(e); }
};

export const deleteWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id, req.params.orgId);
    res.json(successResponse(null, 'Webhook deleted'));
  } catch (e) { next(e); }
};

export const getWebhookLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getLogs(req.params.id, req.params.orgId, req.query as any);
    res.json(successResponse(result.logs, undefined, result.meta));
  } catch (e) { next(e); }
};
