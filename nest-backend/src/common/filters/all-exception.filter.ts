import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { 
    ForbiddenError,
    NotFoundContentError,
    UnprocessableError 
} from '../error/custom.error';
  
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    if (exception instanceof HttpException) {
      const responseFromException = exception.getResponse() as
        | { message: string | object }
        | string;

      let exceptionMessage;
      if (
        typeof responseFromException === 'object' &&
        (responseFromException as object).hasOwnProperty('message') // object로 들어오는 경우에 undefined로 출력되지 않게 예외 처리
      ) {
        exceptionMessage = responseFromException.message;
      } else {
        exceptionMessage = responseFromException;
      }

      const httpStatus = exception.getStatus();
      let statusMessage;
      if (400 <= httpStatus && httpStatus < 500) {
        statusMessage = 'fail';
      } else if (500 <= httpStatus && httpStatus < 600) {
        statusMessage = 'error';
      } else {
        statusMessage = 'success';
      }
      const responseBody = {
        status: statusMessage,
        code: httpStatus,
        message: exceptionMessage,
      };

      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    } else if (exception instanceof NotFoundContentError) {
      const responseBody = {
        status: 'fail',
        code: 404,
        message: exception.message,
      };
      httpAdapter.reply(ctx.getResponse(), responseBody, 404);
    } else if (exception instanceof ForbiddenError) {
      const responseBody = {
        status: 'fail',
        code: 403,
        message: exception.message,
      };
      httpAdapter.reply(ctx.getResponse(), responseBody, 403);
    } else if (exception instanceof UnprocessableError) {
      const responseBody = {
        status: 'fail',
        code: 422,
        message: exception.message,
      };
      httpAdapter.reply(ctx.getResponse(), responseBody, 422);
    } 
    // else if (exception instanceof ExpiredSessionError) {
    //   const responseBody = {
    //     status: 'fail',
    //     code: 402,
    //     message: exception.message,
    //   };
    //   const reponse = ctx.getResponse();
    //   reponse.cookie('ProAuthentication', '', {
    //     path: '/',
    //     httpOnly: true,
    //     maxAge: -1,
    //   });
    //   httpAdapter.reply(reponse, responseBody, 402);
    // }
    else {
      const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      const responseBody = {
        status: 'error',
        code: httpStatus,
        message: 'Internal Server Error',
      };
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
}
