import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import {
  listAttributes, getAttribute, createAttribute, updateAttribute, deleteAttribute,
  addAttributeValue, deleteAttributeValue,
} from './attribute.controller';
import { CreateAttributeDto, UpdateAttributeDto, CreateAttributeValueDto } from './dto/attribute.dto';

const router = Router();

router.get('/', listAttributes);
router.get('/:id', getAttribute);
router.post('/', auth(), rbac('attributes.create'), validateDto(CreateAttributeDto), createAttribute);
router.put('/:id', auth(), rbac('attributes.update'), validateDto(UpdateAttributeDto), updateAttribute);
router.delete('/:id', auth(), rbac('attributes.delete'), deleteAttribute);
router.post('/:id/values', auth(), rbac('attributes.update'), validateDto(CreateAttributeValueDto), addAttributeValue);
router.delete('/:id/values/:valueId', auth(), rbac('attributes.update'), deleteAttributeValue);

export default router;
