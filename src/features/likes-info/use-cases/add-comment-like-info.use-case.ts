import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { LikesInfoRepository } from '../infrastructure/repository/likes-info.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLikesInfo,
  CommentLikesInfoModelType,
} from '../domain/comment-likes-info.schema';

export class AddCommentLikeInfoCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(AddCommentLikeInfoCommand)
export class AddCommentLikeInfoUseCase
  implements ICommandHandler<AddCommentLikeInfoCommand>
{
  constructor(
    @InjectModel(CommentLikesInfo.name)
    private commentsLikesInfoModel: CommentLikesInfoModelType,
    protected likesInfoRepository: LikesInfoRepository,
  ) {}

  async execute(command: AddCommentLikeInfoCommand): Promise<void> {
    const { userId, commentId, likeStatus } = command;
    const commentLikesInfo = this.commentsLikesInfoModel.createInstance(
      {
        commentId,
        userId,
        likeStatus,
      },
      this.commentsLikesInfoModel,
    );

    await this.likesInfoRepository.save(commentLikesInfo);
    return;
  }
}
