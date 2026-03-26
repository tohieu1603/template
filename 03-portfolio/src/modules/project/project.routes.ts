import { Router } from 'express';
import { listProjects, getProject, getProjectBySlug, createProject, updateProject, deleteProject, addProjectImage, deleteProjectImage } from './project.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateProjectDto, UpdateProjectDto, CreateProjectImageDto, ProjectQueryDto } from './dto/project.dto';

const router = Router();

router.get('/', validateDto(ProjectQueryDto, 'query'), listProjects);
router.get('/slug/:slug', getProjectBySlug);
router.get('/:id', getProject);
router.post('/', auth(), rbac('projects.create'), validateDto(CreateProjectDto), createProject);
router.put('/:id', auth(), rbac('projects.update'), validateDto(UpdateProjectDto), updateProject);
router.delete('/:id', auth(), rbac('projects.delete'), deleteProject);
router.post('/:id/images', auth(), rbac('projects.update'), validateDto(CreateProjectImageDto), addProjectImage);
router.delete('/:id/images/:imageId', auth(), rbac('projects.update'), deleteProjectImage);

export default router;
