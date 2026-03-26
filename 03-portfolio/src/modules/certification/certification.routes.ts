import { Router } from 'express';
import { listCertifications, getCertification, createCertification, updateCertification, deleteCertification } from './certification.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateCertificationDto, UpdateCertificationDto, CertificationQueryDto } from './dto/certification.dto';

const router = Router();

router.get('/', validateDto(CertificationQueryDto, 'query'), listCertifications);
router.get('/:id', getCertification);
router.post('/', auth(), rbac('certifications.create'), validateDto(CreateCertificationDto), createCertification);
router.put('/:id', auth(), rbac('certifications.update'), validateDto(UpdateCertificationDto), updateCertification);
router.delete('/:id', auth(), rbac('certifications.delete'), deleteCertification);

export default router;
