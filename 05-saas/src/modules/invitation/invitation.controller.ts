import { Request, Response, NextFunction } from 'express';
import { InvitationService } from './invitation.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new InvitationService();

export const listInvitations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.params.orgId, req.query as any);
    res.json(successResponse(result.invitations, undefined, result.meta));
  } catch (e) { next(e); }
};

export const createInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inv = await service.create(req.params.orgId, req.body, req.user!.id);
    res.status(201).json(successResponse(inv, 'Invitation sent'));
  } catch (e) { next(e); }
};

export const acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.accept(req.body.token, req.user!.id);
    res.json(successResponse(null, 'Invitation accepted'));
  } catch (e) { next(e); }
};

export const revokeInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.revoke(req.params.id, req.params.orgId);
    res.json(successResponse(null, 'Invitation revoked'));
  } catch (e) { next(e); }
};

export const getInvitationByToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inv = await service.getByToken(req.params.token);
    res.json(successResponse(inv));
  } catch (e) { next(e); }
};
