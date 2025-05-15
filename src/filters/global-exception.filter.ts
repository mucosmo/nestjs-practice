import { ExceptionFilter, Catch, HttpStatus, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(exception);

    // 暴露给接口调用者的错误信息
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = 'Internal server error';

    const errorResponse = {
      code: status,
      message: message,
      data: null,
      reqId: request['requestId'],
    };

    response.status(status).json(errorResponse);
  }
}
