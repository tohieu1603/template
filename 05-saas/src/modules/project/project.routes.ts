import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listProjects, getProject, createProject, updateProject, deleteProject } from './project.controller';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/project.dto';

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Organization project management
 */

const router = Router({ mergeParams: true });

router.get('/', auth(), validateDto(ProjectQueryDto, 'query'), listProjects);
router.get('/:id', auth(), getProject);
router.post('/', auth(), validateDto(CreateProjectDto), createProject);
router.put('/:id', auth(), validateDto(UpdateProjectDto), updateProject);
router.delete('/:id', auth(), deleteProject);

export default router;
