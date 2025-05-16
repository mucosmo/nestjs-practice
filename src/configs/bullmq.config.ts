import { registerAs } from '@nestjs/config';
import { QueueOptions } from 'bullmq';

import { ConfigEnum } from '../constants/config.constant';

export default registerAs(
  ConfigEnum.BULLMQ,
  (): QueueOptions => ({
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT),
    },
    prefix: `bull:${process.env.NODE_ENV || 'dev'}${process.env.REDIS_PREFIX ? `:${process.env.REDIS_PREFIX}` : ''}`,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
  }),
);
