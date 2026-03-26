import { Request, Response, NextFunction } from 'express';
import { AuthorService } from './author.service';
import { successResponse } from '../../common/dto/api-response.dto';

const authorService = new AuthorService();

/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: Blog author management (E-E-A-T profiles)
 */

export async function listAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { authors, meta } = await authorService.findAll(req.query as any);
    res.json(successResponse(authors, undefined, meta));
  } catch (error) { next(error); }
}

export async function getAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const author = await authorService.findById(req.params.id);
    res.json(successResponse(author));
  } catch (error) { next(error); }
}

export async function getAuthorBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const author = await authorService.findBySlug(req.params.slug);
    res.json(successResponse(author));
  } catch (error) { next(error); }
}

export async function createAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const author = await authorService.create(req.body);
    res.status(201).json(successResponse(author, 'Author created'));
  } catch (error) { next(error); }
}

export async function updateAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const author = await authorService.update(req.params.id, req.body);
    res.json(successResponse(author, 'Author updated'));
  } catch (error) { next(error); }
}

export async function deleteAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authorService.delete(req.params.id);
    res.json(successResponse(null, 'Author deleted'));
  } catch (error) { next(error); }
}
