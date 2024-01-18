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
import { Response } from 'express';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import {
  PostsPaginationType,
  PostViewType,
} from './models/output/post.output.model';
import {
  PostCreateModel,
  PostQueryModel,
  UpdatePostLikeStatusModel,
} from './models/input/post.input.model';
import { PostsService } from './application/postsService';
import {
  CommentsPaginationType,
  CommentViewType,
} from '../comments/models/output/comment.output.model';
import { CommentsQueryRepository } from '../comments/comments.query-repository';
import { BasicAuthGuard } from '../../infrastructure/guards/basic-auth.guard';
import { CurrentUserId } from '../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { PostsQueryRepository } from './postsQueryRepository';
import { JwtAccessNotStrictGuard } from '../../infrastructure/guards/jwt-access-not-strict.guard';
import {
  CommentQueryModel,
  CreateCommentByPostIdModel,
} from '../comments/models/input/comment.input.model';
import { JwtAccessGuard } from '../../infrastructure/guards/jwt-access.guard';
import { CommentsService } from '../comments/application/comments.service';

@Controller('/posts')
export class PostsController {
  constructor(
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
    protected postsService: PostsService,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Put(':postId/like-status')
  async updateLikeStatusOfPost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string,
    @Body() inputLikeStatusModel: UpdatePostLikeStatusModel,
    @Res() res: Response<string>,
  ) {
    const result = await this.postsService.updateLikeStatus(
      postId,
      userId,
      inputLikeStatusModel.likeStatus,
    );

    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res
          .status(HTTP_STATUS_CODE.NOT_FOUND_404)
          .send("Post with specified id doesn't exist");
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':postId/comments')
  async getAllCommentsForPost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string | null,
    @Query() query: CommentQueryModel,
    @Res() res: Response<CommentsPaginationType>,
  ) {
    const result = await this.commentsRepository.getCommentsByPostId(
      postId,
      query,
      userId,
    );
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessGuard)
  @Post(':postId/comments')
  async createCommentByPostId(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string,
    @Body() inputCommentModel: CreateCommentByPostIdModel,
    @Res() res: Response<CommentViewType>,
  ) {
    const result = await this.commentsService.createCommentByPostId(
      inputCommentModel.content,
      userId,
      postId,
    );

    result
      ? res.status(HTTP_STATUS_CODE.CREATED_201).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get()
  async getAllPosts(
    @Query() query: PostQueryModel,
    @CurrentUserId() userId: string | null,
    @Res() res: Response<PostsPaginationType | string>,
  ) {
    try {
      const result = await this.postsQueryRepository.getAllPosts(query, userId);
      res.status(HTTP_STATUS_CODE.OK_200).send(result);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(
    @Body() inputPostModel: PostCreateModel,
    @Res() res: Response<PostViewType | string>,
  ) {
    debugger;
    const result = await this.postsService.createPost(inputPostModel);

    result
      ? res.status(HTTP_STATUS_CODE.CREATED_201).send(result)
      : res.status(HTTP_STATUS_CODE.NOT_FOUND_404).json('Blog in not found');
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':id')
  async getPostById(
    @Param('id') postId: string,
    @CurrentUserId() userId: string | null,
    @Res() res: Response<PostViewType>,
  ) {
    const result = await this.postsQueryRepository.getPostById(postId, userId);
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') postId: string, @Res() res: Response<void>) {
    const result = await this.postsService.deletePost(postId);

    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }
}
