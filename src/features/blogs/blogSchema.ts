import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogViewType } from './models/output/blog.output.model';
import { HydratedDocument, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  BlogUpdateType,
  CreateBlogModel,
} from './models/input/blog.input.model';

@Schema()
export class Blog {
  _id: ObjectId;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  isMembership: boolean;

  updateBlogInfo(blog: BlogDocument, updatedData: BlogUpdateType): void {
    blog.name = updatedData.name;
    blog.description = updatedData.description;
    blog.websiteUrl = updatedData.websiteUrl;
    return;
  }
  static createInstance(
    blogDTO: CreateBlogModel,
    BlogModel: BlogModelType,
  ): BlogDocument {
    return new BlogModel(blogDTO);
  }

  modifyIntoViewModel(): BlogViewType {
    return {
      id: this._id.toString(),
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt,
      isMembership: this.isMembership,
    };
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  modifyIntoViewModel: Blog.prototype.modifyIntoViewModel,
  updateBlogInfo: Blog.prototype.updateBlogInfo,
};
BlogSchema.statics = {
  modifyIntoViewModel: Blog.createInstance,
};

type BlogModelStaticMethodsType = {
  createInstance: (
    blogDTO: CreateBlogModel,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & BlogModelStaticMethodsType;
