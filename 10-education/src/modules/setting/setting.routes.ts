import { Router } from 'express';
import { listSettings, getSetting, createSetting, updateSetting, deleteSetting } from './setting.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Site settings management
 */
const router = Router();

router.get('/', listSettings);
router.get('/:key', getSetting);
router.post('/', auth(), rbac('settings.create'), validateDto(CreateSettingDto), createSetting);
router.put('/:key', auth(), rbac('settings.update'), validateDto(UpdateSettingDto), updateSetting);
router.delete('/:key', auth(), rbac('settings.delete'), deleteSetting);

export default router;
