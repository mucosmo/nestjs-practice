import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NetworkUtil } from './utils/network.util';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common'; // 导入 Logger

import * as packageJson from '../package.json';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

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
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true, //FIXME: 关闭错误信息没用
      whitelist: true, //移除前端传过来的，但在DTO没有validator装饰器的属性
      forbidNonWhitelisted: false, //禁止前端传过来的未定义的属性
      transform: true, //将前端传过来的数据转换为DTO的类型, 比如将字符串转换为数字
    }),
  );

  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = process.env.PORT ?? 3300;
  await app.listen(port);

  const origin = NetworkUtil.getOrigin(+port);
  const logger = new Logger('Bootstrap');
  logger.log(`Server is listening at ${origin}`);
}
// Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler
// or be explicitly marked as ignored with the `void` operator.eslint@typescript-eslint/no-floating-promises
void bootstrap();
