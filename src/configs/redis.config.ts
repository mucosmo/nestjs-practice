import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';
import { getEnv, getEnvNumeric } from '../utils/env.util';

export interface IRedisConfig {
  uri: string;
}

export default registerAs(ConfigEnum.REDIS, (): IRedisConfig => {
  const host = getEnv('REDIS_HOST');
  const port = getEnvNumeric('REDIS_PORT');

  return {
    uri: `redis://${host}:${port}`,
  };
});
