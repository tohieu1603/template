import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listSeries, getSeriesById, getSeriesBySlug, createSeries, updateSeries, deleteSeries } from './series.controller';
import { CreateSeriesDto, UpdateSeriesDto, SeriesQueryDto } from './dto/series.dto';

const router = Router();

// Public endpoints
router.get('/', validateDto(SeriesQueryDto, 'query'), listSeries);
router.get('/slug/:slug', getSeriesBySlug);
router.get('/:id', getSeriesById);

// Admin endpoints
router.post('/', auth(), rbac('series.create'), validateDto(CreateSeriesDto), createSeries);
router.put('/:id', auth(), rbac('series.update'), validateDto(UpdateSeriesDto), updateSeries);
router.delete('/:id', auth(), rbac('series.delete'), deleteSeries);

export default router;
