import { Request, Response, NextFunction } from 'express';
import { MemberService } from './member.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new MemberService();

export const listMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.params.orgId, req.query as any);
    res.json(successResponse(result.members, undefined, result.meta));
  } catch (e) { next(e); }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const m = await service.addMember(req.params.orgId, req.body, req.user!.id);
    res.status(201).json(successResponse(m, 'Member added'));
  } catch (e) { next(e); }
};

export const updateMemberRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const m = await service.updateRole(req.params.orgId, req.params.userId, req.body);
    res.json(successResponse(m, 'Role updated'));
  } catch (e) { next(e); }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.removeMember(req.params.orgId, req.params.userId);
    res.json(successResponse(null, 'Member removed'));
  } catch (e) { next(e); }
};
