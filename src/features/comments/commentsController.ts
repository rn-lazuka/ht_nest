import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import { CommentsRepository } from './commentsRepository';
import { CommentViewType } from './models/output/comment.output.model';

@Controller('/comments')
export class CommentsController {
  constructor(protected commentsRepository: CommentsRepository) {}

  @Get(':id')
  async getCommentById(
    @Param('id') commentId: string,
    @Res() res: Response<CommentViewType | string>,
  ) {
    try {
      const result = await this.commentsRepository.getCommentById(commentId);
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
