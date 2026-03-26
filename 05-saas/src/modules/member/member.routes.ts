import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listMembers, addMember, updateMemberRole, removeMember } from './member.controller';
import { AddMemberDto, UpdateMemberRoleDto, MemberQueryDto } from './dto/member.dto';

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Organization member management
 */

const router = Router({ mergeParams: true });

router.get('/', auth(), validateDto(MemberQueryDto, 'query'), listMembers);
router.post('/', auth(), validateDto(AddMemberDto), addMember);
router.put('/:userId', auth(), validateDto(UpdateMemberRoleDto), updateMemberRole);
router.delete('/:userId', auth(), removeMember);

export default router;
