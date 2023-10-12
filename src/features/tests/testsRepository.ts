import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Post, PostModelType } from '../posts/postSchema';
import { Blog, BlogModelType } from '../blogs/blogSchema';
import { User, UserModelType } from '../users/userSchema';
import { Comment, CommentModelType } from '../comments/commentSchema';
import {
  CommentLikesInfo,
  CommentLikesInfoModelType,
} from '../likes-info/domain/comment-likes-info.schema';
import {
  PostLikesInfo,
  PostLikesInfoModelType,
} from '../likes-info/domain/post-likes-info.schema';
import { Device, DeviceModelType } from '../devices/domain/device.schema';

@Injectable()
export class TestsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(User.name)
    private UserModel: UserModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(CommentLikesInfo.name)
    private CommentLikesInfoModel: CommentLikesInfoModelType,
    @InjectModel(PostLikesInfo.name)
    private PostLikesInfoModel: PostLikesInfoModelType,
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
  ) {}

  async deleteAllData(): Promise<void> {
    return Promise.all([
      this.PostModel.deleteMany({}),
      this.BlogModel.deleteMany({}),
      this.UserModel.deleteMany({}),
      this.CommentModel.deleteMany({}),
      this.DeviceModel.deleteMany({}),
      this.CommentLikesInfoModel.deleteMany({}),
      this.PostLikesInfoModel.deleteMany({}),
    ]).then(
      (value) => {
        console.log('OK');
      },
      (reason) => {
        console.log(reason);
      },
    );
  }
}
