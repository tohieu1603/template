import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listSettings, getSetting, createSetting, updateSetting, bulkUpdateSettings, deleteSetting } from './setting.controller';
import { CreateSettingDto, UpdateSettingDto, BulkUpdateSettingDto, SettingQueryDto } from './dto/setting.dto';

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Application settings management
 */

const router = Router();

router.get('/', auth(), rbac('settings.view'), validateDto(SettingQueryDto, 'query'), listSettings);
router.get('/:key', auth(), rbac('settings.view'), getSetting);
router.post('/', auth(), rbac('settings.create'), validateDto(CreateSettingDto), createSetting);
router.put('/bulk', auth(), rbac('settings.update'), validateDto(BulkUpdateSettingDto), bulkUpdateSettings);
router.put('/:key', auth(), rbac('settings.update'), validateDto(UpdateSettingDto), updateSetting);
router.delete('/:key', auth(), rbac('settings.delete'), deleteSetting);

export default router;
