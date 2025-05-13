import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CaslModule } from 'src/casl/casl.module';
import { EncryptUtil } from 'src/utils/encypt.util';

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
  ],
  controllers: [UserController],
  providers: [UserService, UserSubscriber, AudioProcessor],
  exports: [UserService],
})
export class UserModule {}
