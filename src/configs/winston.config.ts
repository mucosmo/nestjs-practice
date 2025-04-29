import { registerAs } from '@nestjs/config';
import { ConfigEnum } from '../constants/config.constant';

import 'winston-daily-rotate-file';
import * as winston from 'winston';
import * as packageJson from '../../package.json';

/** 定义不同日志级别的颜色代码 */
const colors = {
  error: '\x1b[31m', // 红色
  warn: '\x1b[33m', // 黄色
  info: '\x1b[32m', // 绿色
  debug: '\x1b[36m', // 青色
  verbose: '\x1b[35m', // 紫色
  reset: '\x1b[0m', // 重置颜色
  pid: '\x1b[90m',
  ms: '\x1b[90m', // 灰色
  label: '\x1b[32m',
  context: '\x1b[36m',
  time: '\x1b[34m',
};
const pidColor = colors.pid;
const msColor = colors.ms;
const labelColor = colors.info;
const resetColor = colors.reset;
const contextColor = colors.context;
const timeColor = colors.time;

/**控制台和文件共同的格式 */
const baseFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.ms(),
  // winston.format.errors({ stack: true }),
  winston.format.label({ label: packageJson.name, message: false }),
  winston.format.colorize({ level: false, message: false }),
  winston.format.uncolorize({ level: true, message: true }),
);

const printfFormatMessage = (info) => {
  const { timestamp, level, context, ms, label, ...rest } = info;
  let { message } = info;
  if (level === 'error') {
    message = rest.stack?.[0] || message;
  }
  if (message === 'undefined') message = '';
  // 如果有额外数据，添加为 JSON
  if (Object.keys(rest).length > 0 && !rest.splat) {
    const metadata = { ...rest };
    delete metadata.splat;
    delete metadata.label;
    delete metadata.message;
    delete metadata.stack;
    delete metadata.error;
    if (Object.keys(metadata).length > 0) {
      message += `${JSON.stringify(metadata)}`;
    }
  }
  return message;
};

/**控制台日志打印格式 */
const printfFormatConsole = (info) => {
  const { timestamp, level, context, ms, label } = info;
  const levelUpper = level.toUpperCase().padStart(5, ' ');
  const message = printfFormatMessage(info);
  const levelColor = colors[level.toLowerCase()] || '';
  let printStr = `${labelColor}[${label}]${resetColor} ${pidColor}${process.pid}${resetColor}\
  ${timeColor}${timestamp}${resetColor}\
 ${levelColor}${levelUpper}${resetColor}\
 ${contextColor}[${context}]${resetColor}\
 ${levelColor}${message}${resetColor}\
 ${msColor}${ms}${resetColor}`;
  return printStr;
};

/**文件日志打印格式 */
const printfFormatFile = (info) => {
  const { timestamp, level, context, ms } = info;
  const message = printfFormatMessage(info);
  const levelUpper = level.toUpperCase().padStart(5, ' ');
  return `${timestamp} ${process.pid} ${levelUpper} [${context}] ${message} ${ms}`;
};

// 此处会异步注册
export default registerAs(ConfigEnum.WINSTON, () => [
  new winston.transports.Console({
    format: winston.format.combine(
      baseFormat,
      winston.format.printf((info) => printfFormatConsole(info)),
    ),
  }),
  new winston.transports.DailyRotateFile({
    dirname: `logs`,
    filename: `%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '100m',
    maxFiles: '31d',
    format: winston.format.combine(
      baseFormat,
      winston.format.printf((info) => printfFormatFile(info)),
    ),
  }),
]);
