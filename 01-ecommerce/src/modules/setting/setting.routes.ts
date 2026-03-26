import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listSettings, getSetting, createSetting, updateSetting, bulkUpdateSettings, deleteSetting, getPublicSettings } from './setting.controller';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';

const router = Router();

// Public settings
router.get('/public', getPublicSettings);

// Admin settings management
router.get('/', auth(), rbac('settings.view'), listSettings);
router.post('/', auth(), rbac('settings.create'), validateDto(CreateSettingDto), createSetting);
router.put('/bulk', auth(), rbac('settings.update'), bulkUpdateSettings);
router.get('/:key', auth(), rbac('settings.view'), getSetting);
router.put('/:key', auth(), rbac('settings.update'), validateDto(UpdateSettingDto), updateSetting);
router.delete('/:key', auth(), rbac('settings.delete'), deleteSetting);

export default router;
