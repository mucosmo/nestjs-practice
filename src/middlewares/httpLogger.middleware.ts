import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common'; // 导入 Logger

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(this.constructor.name);
  constructor() {}
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const originalUrl = req.originalUrl || req.url; // originalUrl 通常更完整
    const userAgent = req.headers['user-agent'];
    res.on('finish', () => {
      this.logger.log(
        `${req.method} ${originalUrl} ${res.statusCode} ${Date.now() - startTime}ms - ${ip} - ${userAgent || ''}`,
      );
    });
    next();
  }
}
