import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';

export interface IRedisConfig {
  uri: string;
}

export default registerAs(ConfigEnum.REDIS, (): IRedisConfig => {
  return {
    uri: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  };
});
