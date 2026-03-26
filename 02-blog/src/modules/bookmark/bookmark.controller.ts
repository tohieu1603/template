import { Request, Response, NextFunction } from 'express';
import { BookmarkService } from './bookmark.service';
import { successResponse } from '../../common/dto/api-response.dto';

const bookmarkService = new BookmarkService();

/**
 * @swagger
 * tags:
 *   name: Bookmarks
 *   description: User bookmark and collection management
 */

// ---- Collections ----

export async function listCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collections = await bookmarkService.getUserCollections(req.user!.id);
    res.json(successResponse(collections));
  } catch (error) { next(error); }
}

export async function getCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collection = await bookmarkService.getCollection(req.params.id, req.user!.id);
    res.json(successResponse(collection));
  } catch (error) { next(error); }
}

export async function createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collection = await bookmarkService.createCollection(req.user!.id, req.body);
    res.status(201).json(successResponse(collection, 'Collection created'));
  } catch (error) { next(error); }
}

export async function updateCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collection = await bookmarkService.updateCollection(req.params.id, req.user!.id, req.body);
    res.json(successResponse(collection, 'Collection updated'));
  } catch (error) { next(error); }
}

export async function deleteCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await bookmarkService.deleteCollection(req.params.id, req.user!.id);
    res.json(successResponse(null, 'Collection deleted'));
  } catch (error) { next(error); }
}

// ---- Bookmarks ----

export async function listBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookmarks = await bookmarkService.getUserBookmarks(req.user!.id);
    res.json(successResponse(bookmarks));
  } catch (error) { next(error); }
}

export async function addBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookmark = await bookmarkService.addBookmark(req.user!.id, req.body);
    res.status(201).json(successResponse(bookmark, 'Bookmarked'));
  } catch (error) { next(error); }
}

export async function updateBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookmark = await bookmarkService.updateBookmark(req.params.id, req.user!.id, req.body);
    res.json(successResponse(bookmark, 'Bookmark updated'));
  } catch (error) { next(error); }
}

export async function removeBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await bookmarkService.removeBookmark(req.params.id, req.user!.id);
    res.json(successResponse(null, 'Bookmark removed'));
  } catch (error) { next(error); }
}
