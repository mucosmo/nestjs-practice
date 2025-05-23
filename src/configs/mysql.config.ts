import { registerAs } from '@nestjs/config';

import { ConfigEnum } from '../constants/config.constant';

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
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_NAME || '',
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DATABASE || '',
    autoLoadEntities: true,
    synchronize: true,
  }),
);
