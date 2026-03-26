import { Request, Response, NextFunction } from 'express';
import { AddressService } from './address.service';
import { successResponse } from '../../common/dto/api-response.dto';

const addressService = new AddressService();

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User address management
 */

export async function listAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const addresses = await addressService.findByUser(req.user!.id);
    res.json(successResponse(addresses));
  } catch (error) { next(error); }
}

export async function getAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const address = await addressService.findById(req.params.id, req.user!.id);
    res.json(successResponse(address));
  } catch (error) { next(error); }
}

export async function createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const address = await addressService.create(req.user!.id, req.body);
    res.status(201).json(successResponse(address, 'Address created'));
  } catch (error) { next(error); }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const address = await addressService.update(req.params.id, req.user!.id, req.body);
    res.json(successResponse(address, 'Address updated'));
  } catch (error) { next(error); }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await addressService.delete(req.params.id, req.user!.id);
    res.json(successResponse(null, 'Address deleted'));
  } catch (error) { next(error); }
}

export async function setDefaultAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const address = await addressService.setDefault(req.params.id, req.user!.id);
    res.json(successResponse(address, 'Default address set'));
  } catch (error) { next(error); }
}
