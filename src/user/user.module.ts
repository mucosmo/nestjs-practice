import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSubscriber } from './user.subscriber';
import { BullModule } from '@nestjs/bullmq';
import { BullmqQueueName } from '../constants/bullmq.constant';
import { AudioProcessor } from './consumers/audio.consumer';

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
  ],
  controllers: [UserController],
  providers: [UserService, UserSubscriber, AudioProcessor],
})
export class UserModule {}
