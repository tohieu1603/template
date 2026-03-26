import { AppDataSource } from '../../config/database.config';
import { Post } from './entities/post.entity';
import { PostRevision } from './entities/post-revision.entity';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto/post.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { generateSlug } from '../../common/utils/slug.util';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class PostService {
  private postRepo = AppDataSource.getRepository(Post);
  private revisionRepo = AppDataSource.getRepository(PostRevision);

  async findAll(query: PostQueryDto) {
    const { page = 1, limit = 10, search, status, categoryId, authorId, seriesId, tag, isFeatured, isTrending, isPinned } = query;
    const offset = (page - 1) * limit;

    const qb = this.postRepo.createQueryBuilder('p')
      .orderBy('p.publishedAt', 'DESC')
      .addOrderBy('p.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (search) {
      qb.where('(p.title ILIKE :s OR p.excerpt ILIKE :s)', { s: `%${search}%` });
    }
    if (status) qb.andWhere('p.status = :status', { status });
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (authorId) qb.andWhere('p.authorId = :authorId', { authorId });
    if (seriesId) qb.andWhere('p.seriesId = :seriesId', { seriesId });
    if (isFeatured === 'true') qb.andWhere('p.isFeatured = true');
    if (isTrending === 'true') qb.andWhere('p.isTrending = true');
    if (isPinned === 'true') qb.andWhere('p.isPinned = true');

    // Filter by tag slug via join
    if (tag) {
      qb.innerJoin('post_tags', 'pt', 'pt.post_id = p.id')
        .innerJoin('tags', 'tg', 'tg.id = pt.tag_id AND tg.slug = :tag', { tag });
    }

    const [posts, total] = await qb.getManyAndCount();
    const enriched = await Promise.all(posts.map((p) => this.enrichPost(p)));
    return { posts: enriched, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundError('Post');
    return this.enrichPostFull(post);
  }

  async findBySlug(slug: string) {
    const post = await this.postRepo.findOne({ where: { slug } });
    if (!post) throw new NotFoundError('Post');
    return this.enrichPostFull(post);
  }

  async create(dto: CreatePostDto): Promise<any> {
    const slug = dto.slug ?? generateSlug(dto.title);
    const existing = await this.postRepo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Slug '${slug}' already in use`);

    const { tagIds, ...postData } = dto;
    const post = await this.postRepo.save(this.postRepo.create({ ...postData, slug }));

    if (tagIds?.length) {
      await this.syncTags(post.id, tagIds);
    }

    return this.findById(post.id);
  }

  async update(id: string, dto: UpdatePostDto, userId: string): Promise<any> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundError('Post');

    if (dto.slug && dto.slug !== post.slug) {
      const existing = await this.postRepo.findOne({ where: { slug: dto.slug } });
      if (existing) throw new ConflictError(`Slug '${dto.slug}' already in use`);
    }

    // Save revision before update
    if (post.content || post.title) {
      await this.revisionRepo.save(this.revisionRepo.create({
        postId: post.id,
        title: post.title,
        content: post.content ?? '',
        contentBlocks: post.contentBlocks,
        revisedBy: userId,
        revisionNote: dto.revisionNote,
      }));
    }

    const { tagIds, revisionNote, ...postData } = dto;
    Object.assign(post, postData);
    await this.postRepo.save(post);

    if (tagIds !== undefined) {
      await this.syncTags(id, tagIds);
    }

    return this.findById(id);
  }

  async publish(id: string): Promise<any> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundError('Post');
    post.status = 'published';
    post.publishedAt = post.publishedAt ?? new Date();
    await this.postRepo.save(post);
    return this.findById(id);
  }

  async unpublish(id: string): Promise<any> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundError('Post');
    post.status = 'draft';
    await this.postRepo.save(post);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundError('Post');
    await this.postRepo.remove(post);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.postRepo.increment({ id }, 'viewCount', 1);
  }

  async getRevisions(postId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post');
    return this.revisionRepo.find({
      where: { postId },
      order: { createdAt: 'DESC' },
    });
  }

  private async enrichPost(post: Post) {
    const tags = await this.getPostTags(post.id);
    return { ...post, tags };
  }

  private async enrichPostFull(post: Post) {
    const tags = await this.getPostTags(post.id);
    return { ...post, tags };
  }

  private async getPostTags(postId: string) {
    return AppDataSource.query(
      `SELECT t.id, t.name, t.slug, t.color
       FROM tags t
       JOIN post_tags pt ON pt.tag_id = t.id
       WHERE pt.post_id = $1
       ORDER BY t.name ASC`,
      [postId],
    );
  }

  private async syncTags(postId: string, tagIds: string[]): Promise<void> {
    await AppDataSource.query('DELETE FROM post_tags WHERE post_id = $1', [postId]);
    if (tagIds.length) {
      const values = tagIds.map((tagId) => `('${postId}', '${tagId}')`).join(',');
      await AppDataSource.query(
        `INSERT INTO post_tags (post_id, tag_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      );
    }
  }
}
