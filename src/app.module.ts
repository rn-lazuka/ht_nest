import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './features/users/userSchema';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './features/users/usersController';
import { UsersService } from './features/users/usersService';
import { UsersRepository } from './features/users/usersRepository';
import * as process from 'process';
import { Comment, CommentSchema } from './features/comments/commentSchema';
import { CommentsController } from './features/comments/commentsController';
import { CommentsRepository } from './features/comments/commentsRepository';
import { Post, PostSchema } from './features/posts/postSchema';
import { Blog, BlogSchema } from './features/blogs/blogSchema';
import { BlogsController } from './features/blogs/blogsController';
import { PostsController } from './features/posts/postsController';
import { BlogsService } from './features/blogs/blogsService';
import { PostsService } from './features/posts/application/postsService';
import { BlogsRepository } from './features/blogs/blogsRepository';
import { PostsRepository } from './features/posts/postsRepository';
import { TestsRepository } from './features/tests/testsRepository';
import { TestsController } from './features/tests/testsController';

console.log(process.env.MONGO_URL);

@Module({
  imports: [
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
    ]),
  ],
  controllers: [
    UsersController,
    CommentsController,
    BlogsController,
    PostsController,
    TestsController,
  ],
  providers: [
    UsersService,
    BlogsService,
    PostsService,
    UsersRepository,
    BlogsRepository,
    PostsRepository,
    CommentsRepository,
    TestsRepository,
  ],
})
export class AppModule {}
