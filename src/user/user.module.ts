import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CaslModule } from 'src/casl/casl.module';
import { ITcpMicroserviceConfig } from 'src/configs/tcp.micrservice.config';
import { ConfigEnum } from 'src/constants/config.constant';
import { EMicroservice } from 'src/constants/microservice.constants';

import { BullmqQueueName } from '../constants/bullmq.constant';

import { AudioProcessor } from './consumers/audio.consumer';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSubscriber } from './user.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue(
      {
        name: BullmqQueueName.AUDIO,
      },
      {
        name: BullmqQueueName.VIDEO,
      },
    ),
    CaslModule,
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: EMicroservice.MATH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          ...configService.get<ITcpMicroserviceConfig>(ConfigEnum.MICRO_TCP)!,
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserSubscriber, AudioProcessor],
  exports: [UserService],
})
export class UserModule {}
