import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';

export default registerAs(ConfigEnum.REDIS, () => ({
  uri: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
}));
