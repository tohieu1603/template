import { Request, Response, NextFunction } from 'express';
import { SeriesService } from './series.service';
import { successResponse } from '../../common/dto/api-response.dto';

const seriesService = new SeriesService();

/**
 * @swagger
 * tags:
 *   name: Series
 *   description: Blog series management
 */

export async function listSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { series, meta } = await seriesService.findAll(req.query as any);
    res.json(successResponse(series, undefined, meta));
  } catch (error) { next(error); }
}

export async function getSeriesById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const series = await seriesService.findById(req.params.id);
    res.json(successResponse(series));
  } catch (error) { next(error); }
}

export async function getSeriesBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const series = await seriesService.findBySlug(req.params.slug);
    res.json(successResponse(series));
  } catch (error) { next(error); }
}

export async function createSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const series = await seriesService.create(req.body);
    res.status(201).json(successResponse(series, 'Series created'));
  } catch (error) { next(error); }
}

export async function updateSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const series = await seriesService.update(req.params.id, req.body);
    res.json(successResponse(series, 'Series updated'));
  } catch (error) { next(error); }
}

export async function deleteSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await seriesService.delete(req.params.id);
    res.json(successResponse(null, 'Series deleted'));
  } catch (error) { next(error); }
}
