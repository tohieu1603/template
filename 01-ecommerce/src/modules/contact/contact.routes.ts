import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listContacts, getContact, submitContact, markContactRead, deleteContact } from './contact.controller';
import { CreateContactDto } from './dto/contact.dto';

const router = Router();

// Public contact form submission
router.post('/', validateDto(CreateContactDto), submitContact);

// Admin management
router.get('/', auth(), rbac('contacts.view'), listContacts);
router.get('/:id', auth(), rbac('contacts.view'), getContact);
router.patch('/:id/read', auth(), rbac('contacts.update'), markContactRead);
router.delete('/:id', auth(), rbac('contacts.delete'), deleteContact);

export default router;
