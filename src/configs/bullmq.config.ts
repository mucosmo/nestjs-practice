import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';

export interface IBullmqConfig {
  host: string;
  port: number;
}

//FIXME: 不同环境的队列名称
export default registerAs(ConfigEnum.BULLMQ, () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}));
