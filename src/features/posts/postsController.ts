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
import { Response } from 'express';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import { PostsRepository } from './postsRepository';
import {
  PostsPaginationType,
  PostViewType,
} from './models/output/post.output.model';
import {
  PostCreateModel,
  PostQueryModel,
} from './models/input/post.input.model';
import { PostsService } from './application/postsService';
import { CommentsPaginationType } from '../comments/models/output/comment.output.model';
import { CommentsRepository } from '../comments/commentsRepository';

@Controller('/posts')
export class PostsController {
  constructor(
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected postsService: PostsService,
  ) {}

  @Get()
  async getAllPosts(
    @Query() query: PostQueryModel,
    @Res() res: Response<PostsPaginationType | string>,
  ) {
    try {
      const result = await this.postsRepository.getAllPosts(query);
      res.status(HTTP_STATUS_CODE.OK_200).send(result);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @Get(':id')
  async getPostById(
    @Param('id') postId: string,
    @Res() res: Response<PostViewType>,
  ) {
    const result = await this.postsRepository.getPostById(postId);
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @Post()
  async createPost(
    @Body() inputPostModel: PostCreateModel,
    @Res() res: Response<PostViewType | string>,
  ) {
    const result = await this.postsService.createPost(inputPostModel);

    result
      ? res.status(HTTP_STATUS_CODE.CREATED_201).send(result)
      : res.status(HTTP_STATUS_CODE.NOT_FOUND_404).json('Blog in not found');
  }

  @Get(':postId/comments')
  async getAllCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: PostQueryModel,
    @Res() res: Response<CommentsPaginationType>,
  ) {
    const result = await this.commentsRepository.getCommentsByPostId(
      postId,
      query,
    );
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @Put(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() inputPostModel: PostCreateModel,
    @Res() res: Response<void>,
  ) {
    const result = await this.postsService.updatePost(postId, inputPostModel);

    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @Delete(':id')
  async deletePost(@Param('id') postId: string, @Res() res: Response<void>) {
    const result = await this.postsService.deletePost(postId);

    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }
}
