import { AppDataSource } from '../../config/database.config';
import { Reaction } from './entities/reaction.entity';
import { UpsertReactionDto } from './dto/reaction.dto';
import { NotFoundError } from '../../common/errors/app-error';

export class ReactionService {
  private repo = AppDataSource.getRepository(Reaction);

  /**
   * Get all reactions (grouped by type) for a post.
   */
  async getPostReactions(postId: string) {
    const reactions = await AppDataSource.query(
      `SELECT type, COUNT(*) AS count
       FROM reactions
       WHERE post_id = $1
       GROUP BY type
       ORDER BY count DESC`,
      [postId],
    );

    // Get user's own reaction if queried with userId
    return { postId, reactions };
  }

  /**
   * Get reaction summary with current user's reaction.
   */
  async getPostReactionsForUser(postId: string, userId: string) {
    const [reactions, userReaction] = await Promise.all([
      AppDataSource.query(
        `SELECT type, COUNT(*) AS count FROM reactions WHERE post_id = $1 GROUP BY type ORDER BY count DESC`,
        [postId],
      ),
      this.repo.findOne({ where: { postId, userId } }),
    ]);

    return { postId, reactions, userReaction: userReaction?.type ?? null };
  }

  /**
   * Toggle or update a reaction. If same type exists, removes it. Otherwise sets it.
   */
  async toggleReaction(postId: string, userId: string, dto: UpsertReactionDto): Promise<{ reaction: Reaction | null; removed: boolean }> {
    const existing = await this.repo.findOne({ where: { postId, userId } });

    if (existing) {
      if (existing.type === dto.type) {
        // Same reaction - remove it
        await this.repo.remove(existing);
        await this.syncLikeCount(postId);
        return { reaction: null, removed: true };
      } else {
        // Different reaction - update it
        existing.type = dto.type;
        const saved = await this.repo.save(existing);
        await this.syncLikeCount(postId);
        return { reaction: saved, removed: false };
      }
    }

    // No existing reaction - create it
    const reaction = this.repo.create({ postId, userId, type: dto.type });
    const saved = await this.repo.save(reaction);
    await this.syncLikeCount(postId);
    return { reaction: saved, removed: false };
  }

  async removeReaction(postId: string, userId: string): Promise<void> {
    const reaction = await this.repo.findOne({ where: { postId, userId } });
    if (!reaction) throw new NotFoundError('Reaction');
    await this.repo.remove(reaction);
    await this.syncLikeCount(postId);
  }

  /**
   * Sync post like_count (count of 'like' reactions) after changes.
   */
  private async syncLikeCount(postId: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE posts SET like_count = (
        SELECT COUNT(*) FROM reactions WHERE post_id = $1 AND type = 'like'
      ) WHERE id = $1`,
      [postId],
    );
  }
}
