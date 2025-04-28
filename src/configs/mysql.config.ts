import { registerAs } from '@nestjs/config';

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
  'mysql',
  (): IMysqlConfig => ({
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: +(process.env.MYSQL_PORT || 0),
    username: process.env.MYSQL_NAME || '',
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DATABASE || '',
    autoLoadEntities: true,
    synchronize: true,
  }),
);
