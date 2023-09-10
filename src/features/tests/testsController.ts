import { Response } from 'express';
import { TestsRepository } from './testsRepository';
import { Controller, Delete, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('/testing/all-data')
export class TestsController {
  constructor(protected testingRepository: TestsRepository) {}

  @Delete()
  async deleteAllData(@Res() res: Response<void>) {
    await this.testingRepository.deleteAllData();
    res.sendStatus(204);
  }
}
