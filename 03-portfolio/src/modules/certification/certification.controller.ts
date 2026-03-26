import { Request, Response, NextFunction } from 'express';
import { CertificationService } from './certification.service';
import { successResponse } from '../../common/dto/api-response.dto';

const certificationService = new CertificationService();

/**
 * @swagger
 * tags:
 *   name: Certifications
 *   description: Certification management
 */

export async function listCertifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await certificationService.findAll(req.query as any);
    res.json(successResponse(result.certifications, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cert = await certificationService.findById(req.params.id);
    res.json(successResponse(cert));
  } catch (error) { next(error); }
}

export async function createCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cert = await certificationService.create(req.body);
    res.status(201).json(successResponse(cert, 'Certification created'));
  } catch (error) { next(error); }
}

export async function updateCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cert = await certificationService.update(req.params.id, req.body);
    res.json(successResponse(cert, 'Certification updated'));
  } catch (error) { next(error); }
}

export async function deleteCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await certificationService.delete(req.params.id);
    res.json(successResponse(null, 'Certification deleted'));
  } catch (error) { next(error); }
}
