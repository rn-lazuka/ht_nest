import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../../features/blogs/blogsRepository';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsBlogByIdExists', async: true })
@Injectable()
export class IsBlogByIdExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected blogsRepository: BlogsRepository) {}

  async validate(value: string, args: ValidationArguments | any) {
    const blogId = args.object.blogId;
    debugger;
    const blog = await this.blogsRepository.getBlogInstance(blogId);
    return !!blog;
  }

  defaultMessage(args?: ValidationArguments): string {
    return `Blog with such blogId doesn't exist`;
  }
}

// export function IsBlogByIdExists(validationOptions?: ValidationOptions) {
//   return function (object: any, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       constraints: [],
//       validator: IsBlogByIdExistsConstraint,
//     });
//   };
// }
