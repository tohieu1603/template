import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateSettingDto, UpdateSettingDto, SettingQueryDto } from './dto/setting.dto';
import { listSettings, getSetting, createSetting, updateSetting, deleteSetting } from './setting.controller';

const router = Router();

router.get('/', auth(), rbac('settings.view'), validateDto(SettingQueryDto, 'query'), listSettings);
router.get('/:id', auth(), rbac('settings.view'), getSetting);
router.post('/', auth(), rbac('settings.create'), validateDto(CreateSettingDto), createSetting);
router.put('/:id', auth(), rbac('settings.update'), validateDto(UpdateSettingDto), updateSetting);
router.delete('/:id', auth(), rbac('settings.delete'), deleteSetting);

export default router;
