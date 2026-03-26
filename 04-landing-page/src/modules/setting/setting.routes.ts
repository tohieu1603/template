import { Router } from 'express';
import { listSettings, getSetting, upsertSetting, deleteSetting } from './setting.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { UpsertSettingDto } from './dto/setting.dto';

const router = Router();

router.get('/', listSettings);
router.get('/:key', getSetting);
router.post('/', auth(), rbac('settings.update'), validateDto(UpsertSettingDto), upsertSetting);
router.delete('/:key', auth(), rbac('settings.delete'), deleteSetting);

export default router;
