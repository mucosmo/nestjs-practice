import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  code: number;
  message: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // 获取请求信息，可用于记录处理时间或其他上下文信息
    const request = context.switchToHttp().getRequest<Request>();
    const result = next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'Success',
        data,
        // time: new Date().toISOString(),
        // // 可选：添加请求路径等信息
        // path: request.url,
        reqId: request['requestId'],
      })),
    );
    return result;
  }
}
