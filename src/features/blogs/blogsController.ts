import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { BlogsRepository } from './blogsRepository';
import {
  BlogQueryModel,
  BlogUpdateType,
  CreateBlogModel,
} from './models/input/blog.input.model';
import {
  BlogPaginationType,
  BlogViewType,
} from './models/output/blog.output.model';
import { Response } from 'express';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import { BlogsService } from './blogsService';
import {
  PostsPaginationType,
  PostViewType,
} from '../posts/models/output/post.output.model';
import { PostsRepository } from '../posts/postsRepository';
import { PostsService } from '../posts/application/postsService';
import {
  PostCreateFromBlogModel,
  PostCreateModel,
} from '../posts/models/input/post.input.model';

@Controller('/blogs')
export class BlogsController {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    protected postsService: PostsService,
    protected blogsService: BlogsService,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: BlogQueryModel,
    @Res() res: Response<BlogPaginationType>,
  ) {
    try {
      const result = await this.blogsRepository.getAllBlogs(query);
      res.status(HTTP_STATUS_CODE.OK_200).send(result);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @Post()
  async createBlog(
    @Body() createBlogModel: CreateBlogModel,
    @Res() res: Response<BlogViewType | string>,
  ) {
    try {
      const result = await this.blogsService.createBlog(createBlogModel);
      res.status(HTTP_STATUS_CODE.CREATED_201).send(result);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @Get(':id')
  async getBlogById(
    @Param('id') blogId: string,
    @Res() res: Response<BlogViewType>,
  ) {
    const result = await this.blogsRepository.getBlogById(blogId);
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() dataForUpdate: BlogUpdateType,
    @Res() res: Response<void>,
  ) {
    const result = await this.blogsService.updateBlog(blogId, dataForUpdate);
    res.sendStatus(
      result ? HTTP_STATUS_CODE.NO_CONTENT_204 : HTTP_STATUS_CODE.NOT_FOUND_404,
    );
  }

  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string, @Res() res: Response<void>) {
    try {
      const result = await this.blogsRepository.deleteBlog(blogId);

      result
        ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @Query() query: BlogQueryModel,
    @Res() res: Response<PostsPaginationType>,
  ) {
    const result = await this.postsRepository.getAllPostsForBlog(blogId, query);
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @Post(`/:blogId/posts`)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() inputPostModel: PostCreateFromBlogModel,
    @Res() res: Response<PostViewType>,
  ) {
    const postData: PostCreateModel = { blogId, ...inputPostModel };
    const result = await this.postsService.createPost(postData);
    result
      ? res.status(HTTP_STATUS_CODE.CREATED_201).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }
}
