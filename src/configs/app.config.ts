import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';

export default registerAs(ConfigEnum.APP, () => ({
  env: process.env.NODE_ENV ?? 'dev',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX,
  jwtSecret: process.env.JWT_SECRET,
  encryptPassword: process.env.ENCRYPT_PASSWORD,
  encryptSalt: process.env.ENCRYPT_SALT,
}));
