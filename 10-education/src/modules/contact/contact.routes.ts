import { Router } from 'express';
import { listContacts, getContact, createContact, replyContact, deleteContact } from './contact.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateContactDto, ReplyContactDto } from './dto/contact.dto';

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact form submissions
 */
const router = Router();

router.get('/', auth(), rbac('contacts.view'), listContacts);
router.get('/:id', auth(), rbac('contacts.view'), getContact);
router.post('/', validateDto(CreateContactDto), createContact);
router.post('/:id/reply', auth(), rbac('contacts.update'), validateDto(ReplyContactDto), replyContact);
router.delete('/:id', auth(), rbac('contacts.delete'), deleteContact);

export default router;
