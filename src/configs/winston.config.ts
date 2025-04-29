import { registerAs } from '@nestjs/config';
import { ConfigEnum } from '../constants/config.constant';

import 'winston-daily-rotate-file';
import * as winston from 'winston';
import * as packageJson from '../../package.json';

const printfFormat = (info) => {
  const { timestamp, level, message, context, ms, label } = info;
  return `[${label}] ${process.pid} - ${timestamp} ${level.toUpperCase()} [${context}] ${message} ${ms}`;
};

const combineFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY/MM/DD HH:mm:ss',
  }),
  winston.format.ms(),
  winston.format.label({ label: packageJson.name, message: false }),
  winston.format.colorize({ level: false, message: false }),
  winston.format.uncolorize({ level: true, message: true }),
  winston.format.printf((info) => printfFormat(info)),
);

// 此处会异步注册
export default registerAs(ConfigEnum.WINSTON, () => [
  new winston.transports.Console({
    format: combineFormat,
  }),
  new winston.transports.DailyRotateFile({
    dirname: `logs`,
    filename: `%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '100m',
    maxFiles: '31d',
    format: combineFormat,
  }),
]);
