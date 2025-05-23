import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common'; // 导入 Logger
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import * as packageJson from '../package.json';

import { AppModule } from './app.module';
import { ConfigEnum } from './constants/config.constant';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { TcpMicroserviceModule } from './microservice/tcp.module';
import { versionInfo } from './scripts/build-version';
import { InstanceInfoUtil } from './utils/instance-info.util';
import { NetworkUtil } from './utils/network.util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({
      prefix: packageJson.name, // Default is "Nest"
      logLevels: ['error', 'warn', 'log', 'debug'],
      timestamp: true,
      colors: true,
      json: false,
      maxStringLength: Infinity,
    }),
  });
  app.enableShutdownHooks();
  app.use(
    helmet({
      hidePoweredBy: true,
    }),
  );
  app.enableCors();
  // 全局注册响应转换拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());
  // HTTP异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true, //FIXME: 关闭错误信息没用
      whitelist: true, //移除前端传过来的，但在DTO没有validator装饰器的属性
      forbidNonWhitelisted: false, //禁止前端传过来的未定义的属性
      transform: true, //将前端传过来的数据转换为DTO的类型, 比如将字符串转换为数字
    }),
  );

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  //NOTE: 如果有nginx, 最好在nginx上实现这个功能
  //不是所有情况都能加速响应的
  app.use(
    compression({
      level: 6, // 压缩级别，范围是 0-9，0 表示不压缩，9 表示最高压缩率
      threshold: 1024 * 1024, // 只有在响应体大于这个值时才会进行压缩
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false; // 根据请求头判断是否需要压缩
        }
        return compression.filter(req, res);
      },
    }),
  );

  const configService = app.get(ConfigService);

  const port = configService.get(ConfigEnum.APP).port;
  await app.listen(port);

  const origin = NetworkUtil.getOrigin(+port);
  const logger = new Logger('Bootstrap');
  logger.log(`Server is listening at ${origin}`);
  logger.log({ version: versionInfo() });
  const instanceInfoUtil = app.get(InstanceInfoUtil);
  logger.log({ instanceInfo: instanceInfoUtil.getInstanceInfo() });

  process.on('unhandledRejection', (err) => {
    logger.error({ msg: 'unhandledRejection', err });
  });

  process.on('uncaughtException', (err) => {
    logger.error({ msg: 'uncaughtException', err });
  });

  const tcpApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    TcpMicroserviceModule,
    configService.get(ConfigEnum.MICRO_TCP),
  );
  const { host: tcpHost, port: tcpPort } = configService.get(ConfigEnum.MICRO_TCP).options;
  await tcpApp.listen().then(() => {
    logger.log(`TCP microservice is listening at ${tcpHost}:${tcpPort}`);
  });
}
// Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler
// or be explicitly marked as ignored with the `void` operator.eslint@typescript-eslint/no-floating-promises
void bootstrap();
