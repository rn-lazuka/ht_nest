import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    try {
      if (status === 400) {
        const errorsResponse: any = {
          errorsMessages: [],
        };
        const responseBody: any = exception.getResponse();

        responseBody.message.forEach((m) =>
          errorsResponse.errorsMessages.push(m),
        );
        response.status(status).json(errorsResponse);
      } else if (status === 500) {
        if (process.env.environment !== 'production') {
          response
            .status(500)
            .send({ error: exception.toString(), stack: exception.stack });
        } else {
          response.status(500).send('Some error occurred');
        }
      } else {
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
}

// @Catch(Error)
// export class ErrorExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//
//     if (process.env.environment !== 'production') {
//       response
//         .status(500)
//         .send({ error: exception.toString(), stack: exception.stack });
//     } else {
//       response.status(500).send('Some error occurred');
//     }
//   }
// }
