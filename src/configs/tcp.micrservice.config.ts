import { registerAs } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

import { ConfigEnum } from '../constants/config.constant';

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
      host: process.env.MICROSERVICE_TCP_HOST || 'localhost',
      port: Number(process.env.MICROSERVICE_TCP_PORT),
    },
  };
});
