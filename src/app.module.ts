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
import { PostsService } from './features/posts/application/postsService';
import { BlogsRepository } from './features/blogs/blogsRepository';
import { PostsRepository } from './features/posts/postsRepository';
import { TestsRepository } from './features/tests/testsRepository';
import { TestsController } from './features/tests/testsController';
import { JwtService } from './features/jwt/jwt.service';
import { AuthController } from './features/auth/api/auth.controller';
import { DevicesController } from './features/devices/api/devices.controller';
import { AuthService } from './features/auth/application/auth.service';
import { CommentsService } from './features/comments/application/comments.service';
import { CommentsRepository } from './features/comments/comments.repository';
import { DevicesService } from './features/devices/application/devices.service';
import { DevicesQueryRepository } from './features/devices/infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from './features/devices/infrastructure/repository/devices.repository';
import { LikesInfoService } from './features/likes-info/application/likes-info.service';
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
import { BlogsService } from './features/blogs/application/blogsService';
import { UsersService } from './features/users/application/usersService';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: LikesInfo.name,
        schema: LikesInfoSchema,
      },
      {
        name: CommentatorInfo.name,
        schema: CommentatorInfoSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: EmailConfirmation.name,
        schema: EmailConfirmationSchema,
      },
      {
        name: PasswordRecovery.name,
        schema: PasswordRecoverySchema,
      },
      {
        name: CommentLikesInfo.name,
        schema: CommentsLikesInfoSchema,
      },
      {
        name: PostLikesInfo.name,
        schema: PostsLikesInfoSchema,
      },
      {
        name: Device.name,
        schema: DeviceSchema,
      },
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
    AuthService,
    BlogsService,
    BlogsRepository,
    CommentsService,
    CommentsQueryRepository,
    CommentsRepository,
    DevicesService,
    DevicesQueryRepository,
    DevicesRepository,
    LikesInfoService,
    LikesInfoQueryRepository,
    LikesInfoRepository,
    PostsService,
    PostsQueryRepository,
    PostsRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    JwtService,
    JwtQueryRepository,
    TestsRepository,

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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
