import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  uri: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
}));
