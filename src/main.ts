import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common'; // 导入 Logger
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import * as packageJson from '../package.json';

import { AppModule } from './app.module';
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
  app.use(
    helmet({
      hidePoweredBy: true,
    }),
  );
  app.enableCors();
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

  const port = process.env.PORT ?? 3300;
  await app.listen(port);

  const origin = NetworkUtil.getOrigin(+port);
  const logger = new Logger('Bootstrap');
  logger.log(`Server is listening at ${origin}`);
  logger.log({ version: versionInfo() });
  const instanceInfoUtil = app.get(InstanceInfoUtil);
  logger.log({ instanceInfo: instanceInfoUtil.getInstanceInfo() });
}
// Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler
// or be explicitly marked as ignored with the `void` operator.eslint@typescript-eslint/no-floating-promises
void bootstrap();
