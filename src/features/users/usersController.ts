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
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserQueryModel } from './types';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import {
  UserViewType,
  ViewAllUsersModels,
} from './models/output/user.output.model';
import { UsersService } from './application/usersService';
import { UsersQueryRepository } from './users.query-repository';
import { CreateUserInputModel } from './models/input/create-user.input.model';
import { BasicAuthGuard } from '../../infrastructure/guards/basic-auth.guard';

@Controller('/users')
export class UsersController {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected usersService: UsersService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllUsers(
    @Query() query: UserQueryModel,
    @Res() res: Response<ViewAllUsersModels | string>,
  ) {
    try {
      const result = await this.usersQueryRepository.getAllUsers(query);
      res.status(HTTP_STATUS_CODE.OK_200).send(result);
    } catch (err) {
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(
    @Body() inputUserModel: CreateUserInputModel,
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

  @UseGuards(BasicAuthGuard)
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
