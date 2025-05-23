import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';
export let redisNamespace;

export default registerAs(ConfigEnum.APP, () => {
  redisNamespace = `${process.env.NODE_ENV || 'dev'}${process.env.REDIS_PREFIX ? `:${process.env.REDIS_PREFIX}` : ''}`;
  return {
    env: process.env.NODE_ENV ?? 'dev',
    port: Number(process.env.PORT),
    apiPrefix: process.env.API_PREFIX,
    jwtSecret: process.env.JWT_SECRET,
    encryptPassword: process.env.ENCRYPT_PASSWORD,
    encryptSalt: process.env.ENCRYPT_SALT,
  };
});
