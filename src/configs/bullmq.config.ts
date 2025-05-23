import { registerAs } from '@nestjs/config';
import { QueueOptions } from 'bullmq';

import { ConfigEnum } from '../constants/config.constant';
import { getEnv, getEnvNumeric } from '../utils/env.util';

import { redisNamespace } from './app.config';

export default registerAs(
  ConfigEnum.BULLMQ,
  (): QueueOptions => ({
    connection: {
      host: getEnv('REDIS_HOST'),
      port: getEnvNumeric('REDIS_PORT'),
    },
    prefix: `${redisNamespace}:bull`,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
  }),
);
