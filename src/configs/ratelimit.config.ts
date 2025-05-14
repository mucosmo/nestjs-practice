import { ExecutionContext } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { Request } from 'express';

import { ConfigEnum } from '../constants/config.constant';

export default registerAs(ConfigEnum.RATELIMIT, () => {
  const throttlers = [
    {
      ttl: 60000,
      limit: 10,
    },
  ];
  const generateKey = (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    let ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    if (Array.isArray(ip)) {
      ip = ip[0];
    }
    const path = request.route?.path || request.url;
    const method = request.method;
    return `${ip}-${path}-${method}`;
  };
  return { throttlers, generateKey };
});
