import { AppDataSource } from '../../config/database.config';
import { BookmarkCollection } from './entities/bookmark-collection.entity';
import { Bookmark } from './entities/bookmark.entity';
import { CreateCollectionDto, UpdateCollectionDto, AddBookmarkDto, UpdateBookmarkDto } from './dto/bookmark.dto';
import { ConflictError, ForbiddenError, NotFoundError } from '../../common/errors/app-error';

export class BookmarkService {
  private collectionRepo = AppDataSource.getRepository(BookmarkCollection);
  private bookmarkRepo = AppDataSource.getRepository(Bookmark);

  // ---- Collections ----

  async getUserCollections(userId: string) {
    return this.collectionRepo.find({
      where: { userId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getCollection(id: string, userId: string) {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== userId && !collection.isPublic) {
      throw new ForbiddenError('Access denied');
    }

    const bookmarks = await AppDataSource.query(
      `SELECT b.*, p.title, p.slug, p.cover_image, p.excerpt, p.published_at
       FROM bookmarks b
       JOIN posts p ON p.id = b.post_id
       WHERE b.collection_id = $1
       ORDER BY b.created_at DESC`,
      [id],
    );

    return { ...collection, bookmarks };
  }

  async createCollection(userId: string, dto: CreateCollectionDto): Promise<BookmarkCollection> {
    const collection = this.collectionRepo.create({ ...dto, userId });
    return this.collectionRepo.save(collection);
  }

  async updateCollection(id: string, userId: string, dto: UpdateCollectionDto): Promise<BookmarkCollection> {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== userId) throw new ForbiddenError('Access denied');

    Object.assign(collection, dto);
    return this.collectionRepo.save(collection);
  }

  async deleteCollection(id: string, userId: string): Promise<void> {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundError('Collection');
    if (collection.userId !== userId) throw new ForbiddenError('Access denied');

    // Remove all bookmarks in collection
    await this.bookmarkRepo.delete({ collectionId: id });
    await this.collectionRepo.remove(collection);
  }

  // ---- Bookmarks ----

  async getUserBookmarks(userId: string) {
    return AppDataSource.query(
      `SELECT b.*, p.title, p.slug, p.cover_image, p.excerpt, p.published_at
       FROM bookmarks b
       JOIN posts p ON p.id = b.post_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId],
    );
  }

  async addBookmark(userId: string, dto: AddBookmarkDto): Promise<Bookmark> {
    // Check duplicate
    const existing = await this.bookmarkRepo.findOne({
      where: { userId, postId: dto.postId, collectionId: dto.collectionId ?? undefined },
    });
    if (existing) throw new ConflictError('Post already bookmarked in this collection');

    // Verify collection ownership if provided
    if (dto.collectionId) {
      const collection = await this.collectionRepo.findOne({ where: { id: dto.collectionId } });
      if (!collection) throw new NotFoundError('Collection');
      if (collection.userId !== userId) throw new ForbiddenError('Access denied');
    }

    const bookmark = this.bookmarkRepo.create({ ...dto, userId });
    return this.bookmarkRepo.save(bookmark);
  }

  async updateBookmark(id: string, userId: string, dto: UpdateBookmarkDto): Promise<Bookmark> {
    const bookmark = await this.bookmarkRepo.findOne({ where: { id } });
    if (!bookmark) throw new NotFoundError('Bookmark');
    if (bookmark.userId !== userId) throw new ForbiddenError('Access denied');

    Object.assign(bookmark, dto);
    return this.bookmarkRepo.save(bookmark);
  }

  async removeBookmark(id: string, userId: string): Promise<void> {
    const bookmark = await this.bookmarkRepo.findOne({ where: { id } });
    if (!bookmark) throw new NotFoundError('Bookmark');
    if (bookmark.userId !== userId) throw new ForbiddenError('Access denied');
    await this.bookmarkRepo.remove(bookmark);
  }

  async isPostBookmarked(postId: string, userId: string): Promise<boolean> {
    const bookmark = await this.bookmarkRepo.findOne({ where: { postId, userId } });
    return !!bookmark;
  }
}
