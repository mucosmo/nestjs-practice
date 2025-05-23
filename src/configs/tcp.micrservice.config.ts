import { registerAs } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

import { ConfigEnum } from '../constants/config.constant';
import { getEnv, getEnvNumeric } from '../utils/env.util';

export interface ITcpMicroserviceConfig {
  transport: Transport.TCP;
  options: {
    host: string;
    port: number;
  };
}

export default registerAs(ConfigEnum.MICRO_TCP, (): ITcpMicroserviceConfig => {
  return {
    transport: Transport.TCP,
    options: {
      host: getEnv('MICROSERVICE_TCP_HOST'),
      port: getEnvNumeric('MICROSERVICE_TCP_PORT'),
    },
  };
});
