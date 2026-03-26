import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listSettings, getSetting, getSettingsByGroup, upsertSetting, bulkUpsertSettings, deleteSetting, getPublicSettings } from './setting.controller';
import { UpsertSettingDto, BulkUpsertSettingDto } from './dto/setting.dto';

const router = Router();

// Public settings
router.get('/public', getPublicSettings);

// Admin settings management
router.get('/', auth(), rbac('settings.view'), listSettings);
router.post('/', auth(), rbac('settings.update'), validateDto(UpsertSettingDto), upsertSetting);
router.put('/bulk', auth(), rbac('settings.update'), validateDto(BulkUpsertSettingDto), bulkUpsertSettings);
router.get('/group/:group', auth(), rbac('settings.view'), getSettingsByGroup);
router.get('/:key', auth(), rbac('settings.view'), getSetting);
router.put('/:key', auth(), rbac('settings.update'), validateDto(UpsertSettingDto), upsertSetting);
router.delete('/:key', auth(), rbac('settings.delete'), deleteSetting);

export default router;
