import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
  PasswordRecovery,
  PasswordRecoverySchema,
  User,
  UserSchema,
} from './features/users/userSchema';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './features/users/usersController';
import { UsersRepository } from './features/users/usersRepository';
import * as process from 'process';
import {
  Comment,
  CommentatorInfo,
  CommentatorInfoSchema,
  CommentSchema,
  LikesInfo,
  LikesInfoSchema,
} from './features/comments/commentSchema';
import { CommentsController } from './features/comments/commentsController';
import { CommentsQueryRepository } from './features/comments/comments.query-repository';
import { Post, PostSchema } from './features/posts/postSchema';
import { Blog, BlogSchema } from './features/blogs/blogSchema';
import { BlogsController } from './features/blogs/blogsController';
import { PostsController } from './features/posts/postsController';
import { BlogsRepository } from './features/blogs/blogs-repository';
import { PostsRepository } from './features/posts/postsRepository';
import { TestsRepository } from './features/tests/testsRepository';
import { TestsController } from './features/tests/testsController';
import { AuthController } from './features/auth/api/auth.controller';
import { DevicesController } from './features/devices/api/devices.controller';
import { CommentsRepository } from './features/comments/comments.repository';
import { DevicesQueryRepository } from './features/devices/infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from './features/devices/infrastructure/repository/devices.repository';
import { LikesInfoQueryRepository } from './features/likes-info/infrastructure/query.repository/likes-info.query.repository';
import { LikesInfoRepository } from './features/likes-info/infrastructure/repository/likes-info.repository';
import { PostsQueryRepository } from './features/posts/postsQueryRepository';
import { UsersQueryRepository } from './features/users/users.query-repository';
import { JwtQueryRepository } from './features/jwt/jwt.query.repository';
import { IsBlogByIdExistsConstraint } from './infrastructure/decorators/posts/blog-id-exists.decorator';
import { LocalStrategy } from './infrastructure/strategy/local.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategy/jwt-refresh.strategy';
import { JwtAccessStrategy } from './infrastructure/strategy/jwt-access.strategy';
import { BasicStrategy } from './infrastructure/strategy/basic.strategy';
import { EmailManager } from './infrastructure/managers/email-manager';
import { CryptoAdapter } from './infrastructure/adapters/crypto.adapter';
import { EmailAdapter } from './infrastructure/adapters/email.adapter';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  CommentLikesInfo,
  CommentsLikesInfoSchema,
} from './features/likes-info/domain/comment-likes-info.schema';
import {
  PostLikesInfo,
  PostsLikesInfoSchema,
} from './features/likes-info/domain/post-likes-info.schema';
import { Device, DeviceSchema } from './features/devices/domain/device.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfirmEmailUseCase } from './features/auth/use-cases/confirm-email.use-case';
import { LoginUserUseCase } from './features/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from './features/auth/use-cases/register-user.use-case';
import { ResendConfirmationEmailMsgUseCase } from './features/auth/use-cases/resend-confirmation-email-message.use-case';
import { SendEmailPassRecoveryUseCase } from './features/auth/use-cases/send-email-pass-recovery.use-case';
import { SaveNewPasswordUseCase } from './features/auth/use-cases/save-new-password.use-case';
import { ValidateUserUseCase } from './features/auth/use-cases/validate-user.use-case';
import { BlogsQueryRepository } from './features/blogs/blogs-query-repository';
import { CreateBlogUseCase } from './features/blogs/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './features/blogs/use-cases/update-blog.use-case';
import { UpdateCommentUseCase } from './features/comments/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './features/comments/use-cases/delete-comment.use-case';
import { CreateCommentByPostIdUseCase } from './features/comments/use-cases/create-comment-by-post-id.use-case';
import { UpdateLikeStatusOfCommentUseCase } from './features/comments/use-cases/update-like-status-of-comment.use-case';
import { DeleteDeviceByRefreshTokenUseCase } from './features/devices/use-cases/delete-device-by-refresh-token.use-case';
import { CreateNewDeviceUseCase } from './features/devices/use-cases/create-new-device.use-case';
import { DeleteDevicesExcludeCurrentUseCase } from './features/devices/use-cases/delete-devices-exclude-current.use-case';
import { DeleteDeviceByIdUseCase } from './features/devices/use-cases/delete-device-by-id.use-case';
import { CreateRefreshJwtTokenUseCase } from './features/jwt/use-cases/create-refresh-jwt-token.use-case';
import { CreateAccessJwtTokenUseCase } from './features/jwt/use-cases/create-access-jwt-token.use-case';
import { ChangeTokenByRefreshTokenUseCase } from './features/jwt/use-cases/change-token-by-refresh-token.use-case';
import { AddCommentLikeInfoUseCase } from './features/likes-info/use-cases/add-comment-like-info.use-case';
import { AddPostLikeInfoUseCase } from './features/likes-info/use-cases/add-post-like-info.use-case';
import { UpdatePostLikeInfoUseCase } from './features/likes-info/use-cases/update-post-like-info.use-case';
import { UpdateCommentLikeInfoUseCase } from './features/likes-info/use-cases/update-comment-like-info.use-case';
import { CreatePostUseCase } from './features/posts/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './features/posts/use-cases/update-post.use-case';
import { UpdatePostLikeStatusUseCase } from './features/posts/use-cases/update-post-like-status.use-case';
import { CreateUserUseCase } from './features/users/use-cases/create-user.use-case';
import { GetUserIdByAccessTokenUseCase } from './features/jwt/use-cases/getUserIdByAccessToken.use-case';
import { CqrsModule } from '@nestjs/cqrs';

const queryRepositories = [
  CommentsQueryRepository,
  DevicesQueryRepository,
  LikesInfoQueryRepository,
  PostsQueryRepository,
  UsersQueryRepository,
  JwtQueryRepository,
  BlogsQueryRepository,
];
const repositories = [
  BlogsRepository,
  CommentsRepository,
  DevicesRepository,
  LikesInfoRepository,
  PostsRepository,
  UsersRepository,
  TestsRepository,
];

const handlers = [
  ConfirmEmailUseCase,
  LoginUserUseCase,
  RegisterUserUseCase,
  ResendConfirmationEmailMsgUseCase,
  SendEmailPassRecoveryUseCase,
  SaveNewPasswordUseCase,
  ValidateUserUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  CreateCommentByPostIdUseCase,
  UpdateLikeStatusOfCommentUseCase,
  DeleteDeviceByRefreshTokenUseCase,
  CreateNewDeviceUseCase,
  DeleteDevicesExcludeCurrentUseCase,
  DeleteDeviceByIdUseCase,
  CreateRefreshJwtTokenUseCase,
  CreateAccessJwtTokenUseCase,
  ChangeTokenByRefreshTokenUseCase,
  AddCommentLikeInfoUseCase,
  AddPostLikeInfoUseCase,
  UpdatePostLikeInfoUseCase,
  UpdateCommentLikeInfoUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  UpdatePostLikeStatusUseCase,
  CreateUserUseCase,
  GetUserIdByAccessTokenUseCase,
];

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10,
        limit: 5,
      },
    ]),
    CqrsModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: LikesInfo.name, schema: LikesInfoSchema },
      { name: CommentatorInfo.name, schema: CommentatorInfoSchema },
      { name: User.name, schema: UserSchema },
      { name: EmailConfirmation.name, schema: EmailConfirmationSchema },
      { name: PasswordRecovery.name, schema: PasswordRecoverySchema },
      { name: CommentLikesInfo.name, schema: CommentsLikesInfoSchema },
      { name: PostLikesInfo.name, schema: PostsLikesInfoSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [
    AuthController,
    BlogsController,
    DevicesController,
    PostsController,
    CommentsController,
    UsersController,
    TestsController,
  ],
  providers: [
    ...queryRepositories,
    ...repositories,

    //Constraints
    IsBlogByIdExistsConstraint,

    //Strategy
    LocalStrategy,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    BasicStrategy,

    //Managers && Adapters
    EmailManager,
    CryptoAdapter,
    EmailAdapter,

    //handlers
    ...handlers,

    //Throttler
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
