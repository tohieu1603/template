import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateContactDto, UpdateContactStatusDto, ContactQueryDto } from './dto/contact.dto';
import { listContacts, getContact, createContact, updateContactStatus, deleteContact } from './contact.controller';

const router = Router();

router.post('/', validateDto(CreateContactDto), createContact);
router.get('/', auth(), rbac('contacts.view'), validateDto(ContactQueryDto, 'query'), listContacts);
router.get('/:id', auth(), rbac('contacts.view'), getContact);
router.put('/:id', auth(), rbac('contacts.update'), validateDto(UpdateContactStatusDto), updateContactStatus);
router.delete('/:id', auth(), rbac('contacts.delete'), deleteContact);

export default router;
