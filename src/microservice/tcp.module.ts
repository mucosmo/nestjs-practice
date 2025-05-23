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

import { getEnvFilePath } from 'src/utils/env.util';

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
      envFilePath: getEnvFilePath(),
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
