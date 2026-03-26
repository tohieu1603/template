import { Router } from 'express';
import { listTables, getTable, createTable, updateTable, updateTableStatus, deleteTable } from './table.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto, TableQueryDto } from './dto/table.dto';

const router = Router();

router.get('/', validateDto(TableQueryDto, 'query'), listTables);
router.get('/:id', getTable);
router.post('/', auth(), rbac('tables.create'), validateDto(CreateTableDto), createTable);
router.put('/:id', auth(), rbac('tables.update'), validateDto(UpdateTableDto), updateTable);
router.patch('/:id/status', auth(), rbac('tables.update'), validateDto(UpdateTableStatusDto), updateTableStatus);
router.delete('/:id', auth(), rbac('tables.delete'), deleteTable);

export default router;
