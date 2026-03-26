import { Router } from 'express';
import { listSettings, getSetting, createSetting, updateSetting, bulkUpdateSettings, deleteSetting } from './setting.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateSettingDto, UpdateSettingDto, BulkUpdateSettingDto, SettingQueryDto } from './dto/setting.dto';

const router = Router();

router.get('/', validateDto(SettingQueryDto, 'query'), listSettings);
router.get('/:key', getSetting);
router.post('/', auth(), rbac('settings.create'), validateDto(CreateSettingDto), createSetting);
router.put('/bulk', auth(), rbac('settings.update'), validateDto(BulkUpdateSettingDto), bulkUpdateSettings);
router.put('/:key', auth(), rbac('settings.update'), validateDto(UpdateSettingDto), updateSetting);
router.delete('/:key', auth(), rbac('settings.delete'), deleteSetting);

export default router;
