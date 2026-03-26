import { AppDataSource } from '../../config/database.config';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto, AdminCommentDto, CommentQueryDto } from './dto/comment.dto';
import { NotFoundError, ForbiddenError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class CommentService {
  private repo = AppDataSource.getRepository(Comment);

  async findByPost(postId: string, query: CommentQueryDto) {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    // Get top-level comments only
    const qb = this.repo.createQueryBuilder('c')
      .where('c.postId = :postId AND c.parentId IS NULL AND c.isApproved = true', { postId })
      .orderBy('c.createdAt', 'ASC')
      .limit(limit)
      .offset(offset);

    const [comments, total] = await qb.getManyAndCount();

    // Load replies for each top-level comment
    const enriched = await Promise.all(comments.map((c) => this.enrichWithReplies(c)));
    return { comments: enriched, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundError('Comment');
    return comment;
  }

  async create(userId: string, dto: CreateCommentDto): Promise<Comment> {
    const comment = this.repo.create({ ...dto, userId });
    const saved = await this.repo.save(comment);

    // Update post comment count
    await AppDataSource.query(
      'UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1',
      [dto.postId],
    );

    return saved;
  }

  async update(id: string, userId: string, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundError('Comment');
    if (comment.userId !== userId) throw new ForbiddenError('Access denied');

    comment.content = dto.content;
    comment.isEdited = true;
    return this.repo.save(comment);
  }

  async adminUpdate(id: string, dto: AdminCommentDto): Promise<Comment> {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundError('Comment');
    Object.assign(comment, dto);
    return this.repo.save(comment);
  }

  async delete(id: string, userId: string, isAdmin = false): Promise<void> {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundError('Comment');
    if (!isAdmin && comment.userId !== userId) throw new ForbiddenError('Access denied');

    // Decrement post comment count
    await AppDataSource.query(
      'UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1',
      [comment.postId],
    );

    await this.repo.remove(comment);
  }

  async toggleLike(id: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundError('Comment');

    // Check if user already liked
    const existing = await AppDataSource.query(
      'SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      [id, userId],
    );

    if (existing.length > 0) {
      // Unlike
      await AppDataSource.query(
        'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        [id, userId],
      );
      await this.repo.decrement({ id }, 'likesCount', 1);
      const updated = await this.repo.findOne({ where: { id } });
      return { liked: false, likesCount: updated!.likesCount };
    } else {
      // Like
      await AppDataSource.query(
        'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, userId],
      );
      await this.repo.increment({ id }, 'likesCount', 1);
      const updated = await this.repo.findOne({ where: { id } });
      return { liked: true, likesCount: updated!.likesCount };
    }
  }

  private async enrichWithReplies(comment: Comment) {
    const replies = await this.repo.find({
      where: { parentId: comment.id, isApproved: true },
      order: { createdAt: 'ASC' },
    });
    return { ...comment, replies };
  }
}
