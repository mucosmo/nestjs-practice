import { createKeyv } from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';
import { WinstonModule } from 'nest-winston';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './configs/app.config';
import bullConfig, { IBullmqConfig } from './configs/bullmq.config';
import mongoConfig from './configs/mongo.config';
import mysqlConfig, { IMysqlConfig } from './configs/mysql.config';
import redisConfig from './configs/redis.config';
import winstonConfig from './configs/winston.config';
import { ConfigEnum } from './constants/config.constant';
import { HttpLoggerMiddleware } from './middlewares/httpLogger.middleware';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      // 从命令行参数中获取环境变量，然后从指定的文件中加载获取其他变量，
      // 用于下面的 load 文件中（先注册后获取）
      envFilePath: [`env/.env.${process.env.NODE_ENV ?? 'dev'}`],
      load: [appConfig, mongoConfig, mysqlConfig, redisConfig, bullConfig, winstonConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get<IMysqlConfig>(ConfigEnum.MYSQL),
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        stores: [
          // new Keyv({
          //   store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
          // }),
          createKeyv(configService.get(ConfigEnum.REDIS)?.uri),
        ],
      }),
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: configService.get<IBullmqConfig>(ConfigEnum.BULLMQ) || {},
      }),
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transports: configService.get(ConfigEnum.WINSTON),
      }),
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .exclude('user/stream') // 排除 user/stream 路由
      .forRoutes('*');
  }
}
