import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
// Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler
// or be explicitly marked as ignored with the `void` operator.eslint@typescript-eslint/no-floating-promises
void bootstrap();
