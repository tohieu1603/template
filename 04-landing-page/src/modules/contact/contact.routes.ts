import { Router } from 'express';
import { listContacts, getContact, createContact, markContactRead, deleteContact } from './contact.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateContactDto } from './dto/contact.dto';

const router = Router();

router.post('/', validateDto(CreateContactDto), createContact);
router.get('/', auth(), rbac('contacts.view'), listContacts);
router.get('/:id', auth(), rbac('contacts.view'), getContact);
router.put('/:id/read', auth(), rbac('contacts.update'), markContactRead);
router.delete('/:id', auth(), rbac('contacts.delete'), deleteContact);

export default router;
