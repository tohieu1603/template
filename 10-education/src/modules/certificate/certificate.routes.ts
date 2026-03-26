import { Router } from 'express';
import { listCertificates, getMyCertificates, generateCertificate, verifyCertificate } from './certificate.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { GenerateCertificateDto } from './dto/certificate.dto';

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: Certificate generation and verification
 */
const router = Router();

router.get('/', auth(), rbac('certificates.view'), listCertificates);
router.get('/my', auth(), getMyCertificates);
router.get('/verify/:number', verifyCertificate);
router.post('/generate', auth(), validateDto(GenerateCertificateDto), generateCertificate);

export default router;
