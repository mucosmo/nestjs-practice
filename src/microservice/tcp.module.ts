import {
  BeforeApplicationShutdown,
  Global,
  Logger,
  MiddlewareConsumer,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';

import configs from '../configs/index.config';
import { ConfigEnum } from '../constants/config.constant';
import { MathModule } from '../math/math.module';
import { HttpLoggerMiddleware } from '../middlewares/httpLogger.middleware';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      // 从命令行参数中获取环境变量，然后从指定的文件中加载获取其他变量，
      // 用于下面的 load 文件中（先注册后获取）
      envFilePath: [`envs/.${process.env.NODE_ENV ?? 'dev'}.env`],
      load: configs,
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transports: configService.get(ConfigEnum.WINSTON),
      }),
    }),
    MathModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class TcpMicroserviceModule
  implements OnModuleInit, BeforeApplicationShutdown, OnApplicationShutdown
{
  private readonly logger = new Logger(TcpMicroserviceModule.name);

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }

  onModuleInit() {
    this.logger.log('App init ...');
  }

  async beforeApplicationShutdown(signal?: string) {
    this.logger.log(`Received close signal (${signal})，ready to close...`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  onApplicationShutdown(signal?: string) {
    this.logger.log(`App is closed (${signal}).`);
  }
}
