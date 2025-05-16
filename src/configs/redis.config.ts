import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';

export interface IRedisConfig {
  uri: string;
}

// 这里无法获取 .env 文件中的变量
export let redisNamespace;

export default registerAs(ConfigEnum.REDIS, (): IRedisConfig => {
  redisNamespace = `${process.env.NODE_ENV || 'dev'}${process.env.REDIS_PREFIX ? `:${process.env.REDIS_PREFIX}` : ''}`;
  return {
    uri: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  };
});
