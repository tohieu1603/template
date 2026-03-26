import { Router } from 'express';
import { listProjectCategories, getProjectCategory, createProjectCategory, updateProjectCategory, deleteProjectCategory } from './project-category.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateProjectCategoryDto, UpdateProjectCategoryDto, ProjectCategoryQueryDto } from './dto/project-category.dto';

const router = Router();

router.get('/', validateDto(ProjectCategoryQueryDto, 'query'), listProjectCategories);
router.get('/:id', getProjectCategory);
router.post('/', auth(), rbac('project_categories.create'), validateDto(CreateProjectCategoryDto), createProjectCategory);
router.put('/:id', auth(), rbac('project_categories.update'), validateDto(UpdateProjectCategoryDto), updateProjectCategory);
router.delete('/:id', auth(), rbac('project_categories.delete'), deleteProjectCategory);

export default router;
