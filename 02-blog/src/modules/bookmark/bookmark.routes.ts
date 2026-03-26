import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import {
  listCollections, getCollection, createCollection, updateCollection, deleteCollection,
  listBookmarks, addBookmark, updateBookmark, removeBookmark,
} from './bookmark.controller';
import { CreateCollectionDto, UpdateCollectionDto, AddBookmarkDto, UpdateBookmarkDto } from './dto/bookmark.dto';

const router = Router();

// All bookmark endpoints require authentication
router.use(auth());

// Collections
router.get('/collections', listCollections);
router.get('/collections/:id', getCollection);
router.post('/collections', validateDto(CreateCollectionDto), createCollection);
router.put('/collections/:id', validateDto(UpdateCollectionDto), updateCollection);
router.delete('/collections/:id', deleteCollection);

// Bookmarks
router.get('/', listBookmarks);
router.post('/', validateDto(AddBookmarkDto), addBookmark);
router.put('/:id', validateDto(UpdateBookmarkDto), updateBookmark);
router.delete('/:id', removeBookmark);

export default router;
