import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NetworkUtil } from './utils/network.util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'], // 只显示错误和警告日志
  });
  const port = process.env.PORT ?? 3300;
  await app.listen(port);

  const origin = NetworkUtil.getOrigin(+port);
  console.log(`Server is listening at ${origin}`);
}
// Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler
// or be explicitly marked as ignored with the `void` operator.eslint@typescript-eslint/no-floating-promises
void bootstrap();
