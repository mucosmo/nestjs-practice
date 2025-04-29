import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { HttpLoggerMiddleware } from './middlewares/httpLogger.middleware';

import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './configs/app.config';
import mongoConfig from './configs/mongo.config';
import mysqlConfig, { IMysqlConfig } from './configs/mysql.config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheModule } from '@nestjs/cache-manager';

import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import redisConfig from './configs/redis.config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: [`env/.env.${process.env.NODE_ENV ?? 'dev'}`],
      load: [appConfig, mongoConfig, mysqlConfig, redisConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get<IMysqlConfig>('mysql'),
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        stores: [
          // new Keyv({
          //   store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
          // }),
          createKeyv(configService.get('redis.uri')),
        ],
      }),
    }),
    ScheduleModule.forRoot(),
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
