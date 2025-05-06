import { registerAs } from '@nestjs/config';
import 'winston-daily-rotate-file';
import * as winston from 'winston';

import * as packageJson from '../../package.json';
import { ConfigEnum } from '../constants/config.constant';

interface WinstonLogInfo extends winston.Logform.TransformableInfo {
  timestamp: string;
  level: string;
  context: string;
  ms: string;
  label: string;
  message: string; // 消息可以是任何类型
  stack?: string[]; // 可选的堆栈信息
  error?: Error; // 可选的错误对象
  [key: string]: any; // 其他可能的元数据
}

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
  winston.format.errors({ stack: true }),
  winston.format.label({ label: packageJson.name, message: false }),
  winston.format.colorize({ level: false, message: false }),
  winston.format.uncolorize({ level: true, message: true }),
);

const printfFormatMessage = (info: WinstonLogInfo) => {
  const { timestamp, level, context, ms, label, ...rest } = info;
  let { message } = info;
  if (level === 'error') {
    message = rest.stack?.[0] || message;
  }
  // 如果有额外数据，添加为 JSON
  if (Object.keys(rest).length > 0 && !rest.splat) {
    // 创建要排除的属性集合
    const excludeProps = ['splat', 'message', 'stack', 'error'];
    // 创建一个新对象，仅包含不在排除列表中的属性
    const metadata = Object.keys(rest)
      .filter((key) => !excludeProps.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = rest[key];
          return obj;
        },
        {} as Record<string, any>,
      );
    if (Object.keys(metadata).length > 0) {
      message += `${JSON.stringify(metadata)}`;
    }
  }
  return message;
};

//TODO: 日志格式化会占用小于 1ms 的时间，
//可以用 performance.now() 亚毫秒级别的时间来观察
/**控制台日志打印格式 */
const printfFormatConsole = (info: WinstonLogInfo) => {
  const { timestamp, level, context, ms, label } = info;
  const levelUpper = level.toUpperCase().padStart(5, ' ');
  const message = printfFormatMessage(info);
  const levelColor = colors[level.toLowerCase()] || '';
  const printStr = `${labelColor}[${label}]${resetColor} ${pidColor}${process.pid}${resetColor}\
 ${timeColor}${timestamp}${resetColor}\
 ${levelColor}${levelUpper}${resetColor}\
 ${contextColor}[${context}]${resetColor}\
 ${levelColor}${message}${resetColor}\
 ${msColor}${ms}${resetColor}`;
  return printStr;
};

/**文件日志打印格式 */
const printfFormatFile = (info: WinstonLogInfo) => {
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
      winston.format.printf((info: WinstonLogInfo) => printfFormatConsole(info)),
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
      winston.format.printf((info: WinstonLogInfo) => printfFormatFile(info)),
    ),
  }),
  new winston.transports.DailyRotateFile({
    dirname: `logs`,
    filename: `%DATE%.error.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '100m',
    maxFiles: '90d',
    format: winston.format.combine(
      baseFormat,
      winston.format.printf((info: WinstonLogInfo) => printfFormatFile(info)),
    ),
    level: 'error',
  }),
]);
