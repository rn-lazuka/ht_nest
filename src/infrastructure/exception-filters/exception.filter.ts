import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HTTP_STATUS_CODE } from '../helpers/enums/http-status';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR_500;

    if (httpStatus === 500) {
      if (process.env.environment !== 'production') {
        response
          .status(httpStatus)
          .send({ error: exception.toString(), stack: exception.stack });
      } else {
        response.status(500).send('Some error occurred');
      }
    } else if (httpStatus === 400) {
      const errorsResponse: any = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();

      responseBody.message.forEach((m) =>
        errorsResponse.errorsMessages.push(m),
      );
      response.status(400).json(errorsResponse);
    } else {
      response.status(httpStatus).json({
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
