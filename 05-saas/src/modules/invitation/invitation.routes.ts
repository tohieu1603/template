import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listInvitations, createInvitation, acceptInvitation, revokeInvitation, getInvitationByToken } from './invitation.controller';
import { CreateInvitationDto, AcceptInvitationDto, InvitationQueryDto } from './dto/invitation.dto';

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Organization invitation management
 */

const router = Router({ mergeParams: true });

router.get('/', auth(), validateDto(InvitationQueryDto, 'query'), listInvitations);
router.post('/', auth(), validateDto(CreateInvitationDto), createInvitation);
router.post('/accept', auth(), validateDto(AcceptInvitationDto), acceptInvitation);
router.get('/token/:token', getInvitationByToken);
router.delete('/:id', auth(), revokeInvitation);

export default router;
