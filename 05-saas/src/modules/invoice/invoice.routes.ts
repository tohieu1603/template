import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listInvoices, getInvoice, markPaid } from './invoice.controller';
import { InvoiceQueryDto, MarkPaidDto } from './dto/invoice.dto';

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management
 */

const router = Router({ mergeParams: true });

router.get('/', auth(), validateDto(InvoiceQueryDto, 'query'), listInvoices);
router.get('/:id', auth(), getInvoice);
router.patch('/:id/mark-paid', auth(), validateDto(MarkPaidDto), markPaid);

export default router;
