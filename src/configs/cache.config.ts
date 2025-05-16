import { createKeyv } from '@keyv/redis';
import { registerAs } from '@nestjs/config';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';

import { ConfigEnum } from '../constants/config.constant';

import { redisNamespace } from './redis.config';

export interface ICacheConfig {
  stores: [];
}

export default registerAs(ConfigEnum.CACHE, () => {
  return {
    stores: [
      createKeyv(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`, {
        namespace: `${redisNamespace}`,
        keyPrefixSeparator: ':',
      }),
      new Keyv({
        store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
      }),
    ],
  };
});
