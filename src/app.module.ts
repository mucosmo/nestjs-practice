import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';

import { ConfigModule } from '@nestjs/config';
import appConfig from './configs/app.config';
import mongoConfig from './configs/mongo.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: [`env/.env.${process.env.NODE_ENV ?? 'dev'}`],
      load: [appConfig, mongoConfig],
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude('user/stream') // 排除 user/stream 路由
      .forRoutes('*');
  }
}
