import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NetworkUtil } from './utils/network.util';
import { Logger } from '@nestjs/common'; // 导入 Logger

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'], // nestjs 框架显示日志
  });
  const port = process.env.PORT ?? 3300;
  await app.listen(port);

  const origin = NetworkUtil.getOrigin(+port);
  const logger = new Logger('Bootstrap');
  logger.log(`Server is listening at ${origin}`);
}
// Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler
// or be explicitly marked as ignored with the `void` operator.eslint@typescript-eslint/no-floating-promises
void bootstrap();
