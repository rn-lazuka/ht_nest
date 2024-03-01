import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import { CommentsQueryRepository } from './comments.query-repository';
import { CommentViewType } from './models/output/comment.output.model';
import { JwtAccessGuard } from '../../infrastructure/guards/jwt-access.guard';
import { CurrentUserId } from '../../infrastructure/decorators/auth/current-user-id.param.decorator';
import {
  UpdateCommentInputModel,
  UpdateCommentLikeStatusInputModel,
} from './models/input/comment.input.model';
import { JwtAccessNotStrictGuard } from '../../infrastructure/guards/jwt-access-not-strict.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './use-cases/update-comment.use-case';
import { DeleteCommentCommand } from './use-cases/delete-comment.use-case';
import { UpdateLikeStatusOfCommentCommand } from './use-cases/update-like-status-of-comment.use-case';

@Controller('/comments')
export class CommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Put(':id/like-status')
  async updateLikeStatusOfComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
    @Body() inputLikeInfoModel: UpdateCommentLikeStatusInputModel,
    @Res() res: Response<string>,
  ) {
    const result = await this.commandBus.execute(
      new UpdateLikeStatusOfCommentCommand(
        commentId,
        userId,
        inputLikeInfoModel.likeStatus,
      ),
    );

    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res
          .status(HTTP_STATUS_CODE.NOT_FOUND_404)
          .send("Comment with specified id doesn't exist");
  }

  @UseGuards(JwtAccessGuard)
  @Put(':id')
  async updateComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
    @Body() inputCommentModel: UpdateCommentInputModel,
    @Res() res: Response<void>,
  ) {
    const result = await this.commandBus.execute(
      new UpdateCommentCommand(commentId, userId, inputCommentModel.content),
    );
    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessGuard)
  @Delete(':id')
  async deleteComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
    @Res() res: Response<void>,
  ) {
    const result = await this.commandBus.execute(
      new DeleteCommentCommand(commentId, userId),
    );
    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':id')
  async getCommentById(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string | null,
    @Res() res: Response<CommentViewType | string>,
  ) {
    try {
      const result = await this.commentsQueryRepository.getCommentById(
        commentId,
        userId,
      );
      result
        ? res.json(result)
        : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }
}
