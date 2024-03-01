import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { LikesInfoRepository } from '../infrastructure/repository/likes-info.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLikesInfo,
  PostLikesInfoModelType,
} from '../domain/post-likes-info.schema';

export class AddPostLikeInfoCommand {
  constructor(
    public userId: string,
    public postId: string,
    public login: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(AddPostLikeInfoCommand)
export class AddPostLikeInfoUseCase
  implements ICommandHandler<AddPostLikeInfoCommand>
{
  constructor(
    @InjectModel(PostLikesInfo.name)
    private postsLikesInfoModel: PostLikesInfoModelType,
    protected likesInfoRepository: LikesInfoRepository,
  ) {}

  async execute(command: AddPostLikeInfoCommand): Promise<void> {
    const { userId, postId, likeStatus, login } = command;
    const postLikesInfo = this.postsLikesInfoModel.createInstance(
      { postId, userId, login, addedAt: new Date().toISOString(), likeStatus },
      this.postsLikesInfoModel,
    );

    await this.likesInfoRepository.save(postLikesInfo);
    return;
  }
}
