import { Router } from 'express';
import { listContacts, getContact, createContact, markContactRead, deleteContact } from './contact.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateContactDto, ContactQueryDto } from './dto/contact.dto';

const router = Router();

router.post('/', validateDto(CreateContactDto), createContact);
router.get('/', auth(), rbac('contacts.view'), validateDto(ContactQueryDto, 'query'), listContacts);
router.get('/:id', auth(), rbac('contacts.view'), getContact);
router.patch('/:id/read', auth(), rbac('contacts.update'), markContactRead);
router.delete('/:id', auth(), rbac('contacts.delete'), deleteContact);

export default router;
