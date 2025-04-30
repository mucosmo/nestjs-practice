import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';

export default registerAs(ConfigEnum.MONGO, () => ({
  uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=${process.env.MONGO_AUTHDB}`,
}));
