import { createKeyv } from '@keyv/redis';
import { registerAs } from '@nestjs/config';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';

import { ConfigEnum } from '../constants/config.constant';
import { getEnv, getEnvNumeric } from '../utils/env.util';

import { redisNamespace } from './app.config';

export interface ICacheConfig {
  stores: [];
}

export default registerAs(ConfigEnum.CACHE, () => {
  const host = getEnv('REDIS_HOST');
  const port = getEnvNumeric('REDIS_PORT');

  return {
    stores: [
      createKeyv(`redis://${host}:${port}`, {
        namespace: `${redisNamespace}`,
        keyPrefixSeparator: ':',
      }),
      new Keyv({
        store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
      }),
    ],
  };
});
