// filepath: /Users/huanyu/Documents/Codes/nestjs-practice/src/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const errorResponse = {
      code: status,
      message: exceptionResponse.message || exception.message,
      data: null,
      reqId: request['requestId'],
    };

    //to avoid confict with winston built-in message field
    errorResponse['msg'] = errorResponse.message;
    delete errorResponse.message;

    this.logger.error(errorResponse);

    response.status(status).json(errorResponse);
  }
}
