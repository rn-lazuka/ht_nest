import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { HttpExceptionFilter } from './infrastructure/exception-filters/exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Трансформация типов
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const errorsForResponse: any = [];
        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints!);
          constraintsKeys.forEach((cKey) => {
            errorsForResponse.push({
              message: e.constraints![cKey],
              field: e.property,
            });
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(5000);
}

bootstrap();
