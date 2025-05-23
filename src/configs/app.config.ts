import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';
import { getEnv, getEnvNumeric } from '../utils/env.util';

export let redisNamespace: string;

export default registerAs(ConfigEnum.APP, () => {
  const nodeEnv = getEnv('NODE_ENV', 'dev');
  const redisPrefix = getEnv('REDIS_PREFIX', '');
  redisNamespace = `${nodeEnv}${redisPrefix ? `:${redisPrefix}` : ''}`;

  return {
    env: nodeEnv,
    port: getEnvNumeric('PORT'),
    apiPrefix: getEnv('API_PREFIX'),
    jwtSecret: getEnv('JWT_SECRET'),
    encryptPassword: getEnv('ENCRYPT_PASSWORD'),
    encryptSalt: getEnv('ENCRYPT_SALT'),
  };
});
