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
  UseGuards,
} from '@nestjs/common';
import { BlogsRepository } from './blogs-repository';
import {
  BlogQueryModel,
  CreateBlogModel,
  UpdateBlogModel,
} from './models/input/blog.input.model';
import {
  BlogPaginationType,
  BlogViewType,
} from './models/output/blog.output.model';
import { Response } from 'express';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import {
  PostsPaginationType,
  PostViewType,
} from '../posts/models/output/post.output.model';
import {
  PostCreateFromBlogModel,
  PostCreateModel,
} from '../posts/models/input/post.input.model';
import { PostsQueryRepository } from '../posts/postsQueryRepository';
import { BasicAuthGuard } from '../../infrastructure/guards/basic-auth.guard';
import { JwtAccessNotStrictGuard } from '../../infrastructure/guards/jwt-access-not-strict.guard';
import { CurrentUserId } from '../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { BlogsQueryRepository } from './blogs-query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './use-cases/create-blog.use-case';
import { UpdateBlogCommand } from './use-cases/update-blog.use-case';
import { CreatePostCommand } from '../posts/use-cases/create-post.use-case';

@Controller('/blogs')
export class BlogsController {
  constructor(
    protected commandBus: CommandBus,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected blogsRepository: BlogsRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: BlogQueryModel,
    @Res() res: Response<BlogPaginationType>,
  ) {
    try {
      const result = await this.blogsQueryRepository.getAllBlogs(query);
      res.status(HTTP_STATUS_CODE.OK_200).send(result);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(
    @Body() createBlogModel: CreateBlogModel,
    @Res() res: Response<BlogViewType | string>,
  ) {
    try {
      const result = await this.commandBus.execute(
        new CreateBlogCommand(createBlogModel),
      );
      res.status(HTTP_STATUS_CODE.CREATED_201).send(result);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post(`:blogId/posts`)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() inputPostModel: PostCreateFromBlogModel,
    @Res() res: Response<PostViewType>,
  ) {
    const postData: PostCreateModel = { blogId, ...inputPostModel };
    const result = await this.commandBus.execute(
      new CreatePostCommand(postData),
    );
    result
      ? res.status(HTTP_STATUS_CODE.CREATED_201).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @Get(':id')
  async getBlogById(
    @Param('id') blogId: string,
    @Res() res: Response<BlogViewType>,
  ) {
    const result = await this.blogsQueryRepository.getBlogById(blogId);
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() dataForUpdate: UpdateBlogModel,
    @Res() res: Response<void>,
  ) {
    const result = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, dataForUpdate),
    );
    res.sendStatus(
      result ? HTTP_STATUS_CODE.NO_CONTENT_204 : HTTP_STATUS_CODE.NOT_FOUND_404,
    );
  }

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string | null,
    @Query() query: BlogQueryModel,
    @Res() res: Response<PostsPaginationType>,
  ) {
    const result = await this.postsQueryRepository.getAllPostsForBlog(
      blogId,
      query,
      userId,
    );
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }
}
