import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(this.constructor.name);
  constructor() {}
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const originalUrl = req.originalUrl || req.url; // originalUrl 通常更完整
    const userAgent = req.headers['user-agent'];
    const requestId = uuidv4();
    req['requestId'] = requestId;
    res.on('finish', () => {
      this.logger.log(
        `${requestId} ${req.method} ${originalUrl} ${res.statusCode} ${Date.now() - startTime}ms - ${String(ip)} - ${userAgent || ''}`,
      );
    });
    next();
  }
}
