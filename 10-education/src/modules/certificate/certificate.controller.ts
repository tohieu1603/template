import { Request, Response, NextFunction } from 'express';
import { CertificateService } from './certificate.service';
import { successResponse } from '../../common/dto/api-response.dto';

const certificateService = new CertificateService();

export const listCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await certificateService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getMyCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await certificateService.getMyCertificates(req.user!.id, req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const generateCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cert = await certificateService.generate(req.body.enrollmentId, req.user!.id);
    res.status(201).json(successResponse(cert, 'Certificate generated'));
  } catch (error) { next(error); }
};

export const verifyCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await certificateService.verify(req.params.number);
    res.json(successResponse(result, result.valid ? 'Certificate is valid' : 'Certificate not found'));
  } catch (error) { next(error); }
};
