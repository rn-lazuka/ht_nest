import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../comments.repository';
import { CommentViewType } from '../models/output/comment.output.model';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../posts/postSchema';
import { Comment, CommentModelType } from '../commentSchema';

export class CreateCommentByPostIdCommand {
  constructor(
    public content: string,
    public userId: string,
    public postId: string,
  ) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase
  implements ICommandHandler<CreateCommentByPostIdCommand>
{
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    @InjectModel(Comment.name)
    private commentModel: CommentModelType,
    protected usersQueryRepository: UsersQueryRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async execute(
    command: CreateCommentByPostIdCommand,
  ): Promise<null | CommentViewType> {
    const { content, userId, postId } = command;
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) {
      return null;
    }

    const post = await this.postModel.findById(postId);
    if (!post) {
      return null;
    }

    const comment = this.commentModel.createInstance(
      content,
      userId.toString(),
      user.login,
      postId,
      this.commentModel,
    );

    await this.commentsRepository.save(comment);
    return comment.convertToViewModel(LikeStatus.None);
  }
}
