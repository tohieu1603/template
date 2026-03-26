import { AppDataSource } from '../../config/database.config';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogTag } from './entities/blog-tag.entity';
import { BlogPost } from './entities/blog-post.entity';
import {
  CreateBlogCategoryDto, UpdateBlogCategoryDto,
  CreateBlogTagDto, UpdateBlogTagDto,
  CreateBlogPostDto, UpdateBlogPostDto,
  BlogPostQueryDto, BlogQueryDto,
} from './dto/blog.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class BlogService {
  private categoryRepo = AppDataSource.getRepository(BlogCategory);
  private tagRepo = AppDataSource.getRepository(BlogTag);
  private postRepo = AppDataSource.getRepository(BlogPost);

  // Categories
  async findAllCategories(query: BlogQueryDto) {
    const { page = 1, limit = 20, search } = query;
    const qb = this.categoryRepo.createQueryBuilder('c').orderBy('c.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('c.name ILIKE :s', { s: `%${search}%` });
    const [categories, total] = await qb.getManyAndCount();
    return { categories, meta: buildPaginationMeta(page, limit, total) };
  }

  async findCategoryById(id: string) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundError('Blog category');
    return cat;
  }

  async createCategory(dto: CreateBlogCategoryDto) {
    const existing = await this.categoryRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError(`Category slug '${dto.slug}' already exists`);
    return this.categoryRepo.save(this.categoryRepo.create(dto));
  }

  async updateCategory(id: string, dto: UpdateBlogCategoryDto) {
    const cat = await this.findCategoryById(id);
    Object.assign(cat, dto);
    return this.categoryRepo.save(cat);
  }

  async deleteCategory(id: string) {
    const cat = await this.findCategoryById(id);
    await this.categoryRepo.remove(cat);
  }

  // Tags
  async findAllTags(query: BlogQueryDto) {
    const { page = 1, limit = 50, search } = query;
    const qb = this.tagRepo.createQueryBuilder('t').orderBy('t.name', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('t.name ILIKE :s', { s: `%${search}%` });
    const [tags, total] = await qb.getManyAndCount();
    return { tags, meta: buildPaginationMeta(page, limit, total) };
  }

  async findTagById(id: string) {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundError('Blog tag');
    return tag;
  }

  async createTag(dto: CreateBlogTagDto) {
    const existing = await this.tagRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError(`Tag slug '${dto.slug}' already exists`);
    return this.tagRepo.save(this.tagRepo.create(dto));
  }

  async updateTag(id: string, dto: UpdateBlogTagDto) {
    const tag = await this.findTagById(id);
    Object.assign(tag, dto);
    return this.tagRepo.save(tag);
  }

  async deleteTag(id: string) {
    const tag = await this.findTagById(id);
    await this.tagRepo.remove(tag);
  }

  // Posts
  async findAllPosts(query: BlogPostQueryDto) {
    const { page = 1, limit = 10, search, categoryId, status, profileId, isFeatured } = query;
    const qb = this.postRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.tags', 'tag')
      .orderBy('p.publishedAt', 'DESC')
      .addOrderBy('p.createdAt', 'DESC')
      .limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(p.title ILIKE :s OR p.excerpt ILIKE :s)', { s: `%${search}%` });
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (status) qb.andWhere('p.status = :status', { status });
    if (profileId) qb.andWhere('p.profileId = :profileId', { profileId });
    if (isFeatured !== undefined) qb.andWhere('p.isFeatured = :isFeatured', { isFeatured: isFeatured === 'true' });
    const [posts, total] = await qb.getManyAndCount();
    return { posts, meta: buildPaginationMeta(page, limit, total) };
  }

  async findPostBySlug(slug: string) {
    const post = await this.postRepo.findOne({ where: { slug }, relations: ['tags'] });
    if (!post) throw new NotFoundError('Blog post');
    return post;
  }

  async findPostById(id: string) {
    const post = await this.postRepo.findOne({ where: { id }, relations: ['tags'] });
    if (!post) throw new NotFoundError('Blog post');
    return post;
  }

  async createPost(dto: CreateBlogPostDto) {
    const existing = await this.postRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError(`Post slug '${dto.slug}' already exists`);
    const { tagIds, ...postData } = dto;
    const post = this.postRepo.create(postData);
    if (tagIds?.length) {
      post.tags = await this.tagRepo.findByIds(tagIds);
    }
    // Calculate reading time
    if (postData.content) {
      post.readingTime = Math.ceil(postData.content.split(' ').length / 200);
    }
    return this.postRepo.save(post);
  }

  async updatePost(id: string, dto: UpdateBlogPostDto) {
    const post = await this.postRepo.findOne({ where: { id }, relations: ['tags'] });
    if (!post) throw new NotFoundError('Blog post');
    const { tagIds, ...postData } = dto;
    Object.assign(post, postData);
    if (tagIds !== undefined) {
      post.tags = tagIds.length ? await this.tagRepo.findByIds(tagIds) : [];
    }
    if (postData.content) {
      post.readingTime = Math.ceil(postData.content.split(' ').length / 200);
    }
    return this.postRepo.save(post);
  }

  async deletePost(id: string) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundError('Blog post');
    await this.postRepo.remove(post);
  }

  async incrementViewCount(id: string) {
    await this.postRepo.increment({ id }, 'viewCount', 1);
  }
}
