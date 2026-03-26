import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listAddresses, getAddress, createAddress, updateAddress, deleteAddress, setDefaultAddress } from './address.controller';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

const router = Router();

router.use(auth());
router.get('/', listAddresses);
router.post('/', validateDto(CreateAddressDto), createAddress);
router.get('/:id', getAddress);
router.put('/:id', validateDto(UpdateAddressDto), updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;
