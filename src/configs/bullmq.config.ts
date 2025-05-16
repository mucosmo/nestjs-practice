import { registerAs } from '@nestjs/config';
import { QueueOptions } from 'bullmq';

import { ConfigEnum } from '../constants/config.constant';

import { redisNamespace } from './app.config';

export default registerAs(
  ConfigEnum.BULLMQ,
  (): QueueOptions => ({
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT),
    },
    prefix: `${redisNamespace}:bull`,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
  }),
);
