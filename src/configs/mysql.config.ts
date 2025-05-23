import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';
import { getEnv, getEnvNumeric } from '../utils/env.util';

export interface IMysqlConfig {
  type: 'mysql' | 'mariadb';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  autoLoadEntities?: boolean;
  synchronize?: boolean;
}

// 此处会异步注册
export default registerAs(
  ConfigEnum.MYSQL,
  (): IMysqlConfig => ({
    type: 'mysql',
    host: getEnv('MYSQL_HOST'),
    port: getEnvNumeric('MYSQL_PORT'),
    username: getEnv('MYSQL_NAME'),
    password: getEnv('MYSQL_PASS'),
    database: getEnv('MYSQL_DATABASE'),
    autoLoadEntities: true,
    synchronize: true,
  }),
);
