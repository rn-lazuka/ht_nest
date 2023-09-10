import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersRepository } from './usersRepository';
import { UsersService } from './usersService';
import { UserQueryModel } from './types';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import { CreateUserModel } from './models/input/user.input.model';
import {
  UserViewType,
  ViewAllUsersModels,
} from './models/output/user.output.model';

@Controller('/users')
export class UsersController {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersService: UsersService,
  ) {}

  @Get()
  async getAllUsers(
    @Query() query: UserQueryModel,
    @Res() res: Response<ViewAllUsersModels | string>,
  ) {
    try {
      const result = await this.usersRepository.getAllUsers(query);
      res.status(HTTP_STATUS_CODE.OK_200).send(result);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @Post()
  async createUser(
    @Body() inputUserModel: CreateUserModel,
    @Res() res: Response<UserViewType | string>,
  ) {
    try {
      const result = await this.usersService.createUser(inputUserModel);
      res.status(HTTP_STATUS_CODE.CREATED_201).send(result);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') userId: string, @Res() res: Response<void>) {
    try {
      const result = await this.usersService.deleteUser(userId);

      result
        ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }
}
