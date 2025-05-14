import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';

export default registerAs(ConfigEnum.RATELIMIT, () => {
  const throttlers = [
    {
      ttl: 60000,
      limit: 10,
    },
  ];
  const generateKey = (context) => {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const path = request.route?.path || request.url;
    const method = request.method;
    return `${ip}-${path}-${method}`;
  };
  return { throttlers, generateKey };
});
