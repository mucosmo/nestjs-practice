import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as winston from 'winston';

import { ConfigEnum } from '../constants/config.constant';

import {
  safeStringify,
  WinstonLogInfo,
  colors,
  printfFormatMessage,
  printfFormatConsole,
  printfFormatFile,
} from './winston.config';

describe('Winston Config', () => {
  let configService: ConfigService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('safeStringify', () => {
    it('should stringify normal objects', () => {
      const obj = { name: 'test', value: 123 };
      const result = safeStringify(obj);
      expect(result).toBe('{"name":"test","value":123}');
    });

    it('should handle Error objects correctly', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      const obj = { error, message: 'Something went wrong' };

      const result = safeStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.error.message).toBe('Test error');
      expect(parsed.error.stack).toBe('Error: Test error\n    at test.js:1:1');
      expect(parsed.message).toBe('Something went wrong');
    });

    it('should handle null and undefined values', () => {
      const obj = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
        falsy: false,
      };

      const result = safeStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.nullValue).toBe('null');
      expect(parsed.undefinedValue).toBe('undefined');
      expect(parsed.emptyString).toBe('');
      expect(parsed.zero).toBe('0'); // safeStringify converts to string
      expect(parsed.falsy).toBe('false'); // safeStringify converts to string
    });

    it('should handle nested Error objects', () => {
      const innerError = new Error('Inner error');
      const outerError = new Error('Outer error');
      (outerError as any).cause = innerError;

      const obj = { error: outerError };
      const result = safeStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.error.message).toBe('Outer error');
      expect(parsed.error.stack).toBeDefined();
      // The cause property should be stringified as well
      expect(result).toContain('Inner error');
    });
  });

  describe('colors', () => {
    it('should have all required color codes', () => {
      expect(colors.error).toBe('\x1b[31m');
      expect(colors.warn).toBe('\x1b[33m');
      expect(colors.info).toBe('\x1b[32m');
      expect(colors.debug).toBe('\x1b[36m');
      expect(colors.verbose).toBe('\x1b[35m');
      expect(colors.reset).toBe('\x1b[0m');
      expect(colors.pid).toBe('\x1b[90m');
      expect(colors.ms).toBe('\x1b[90m');
      expect(colors.label).toBe('\x1b[32m');
      expect(colors.context).toBe('\x1b[36m');
      expect(colors.time).toBe('\x1b[34m');
    });
  });

  describe('printfFormatMessage', () => {
    const baseInfo: WinstonLogInfo = {
      timestamp: '25-05-23 10:30:45.123',
      level: 'info',
      context: 'TestContext',
      ms: '+0ms',
      label: 'test-app',
      message: 'Test message',
    };

    it('should return simple message for basic log info', () => {
      const result = printfFormatMessage(baseInfo);
      expect(result).toBe('Test message');
    });

    it('should handle error level with stack trace', () => {
      const errorInfo: WinstonLogInfo = {
        ...baseInfo,
        level: 'error',
        message: 'Error occurred',
        stack: ['Error: Something went wrong', '    at test.js:1:1'],
      };

      const result = printfFormatMessage(errorInfo);
      expect(result).toBe('Error: Something went wrong');
    });

    it('should handle error level without stack trace', () => {
      const errorInfo: WinstonLogInfo = {
        ...baseInfo,
        level: 'error',
        message: 'Error occurred',
      };

      const result = printfFormatMessage(errorInfo);
      expect(result).toBe('Error occurred');
    });

    it('should format metadata for non-error levels', () => {
      const infoWithMeta: WinstonLogInfo = {
        ...baseInfo,
        userId: 123,
        action: 'login',
        ip: '192.168.1.1',
      };

      const result = printfFormatMessage(infoWithMeta);
      const parsed = JSON.parse(result);

      expect(parsed.userId).toBe(123);
      expect(parsed.action).toBe('login');
      expect(parsed.ip).toBe('192.168.1.1');
    });

    it('should format metadata for error levels with additional data', () => {
      const errorWithMeta: WinstonLogInfo = {
        ...baseInfo,
        level: 'error',
        userId: 123,
        action: 'failed_login',
        stack: ['Error: Invalid credentials'],
      };

      const result = printfFormatMessage(errorWithMeta);
      const parsed = JSON.parse(result);

      expect(parsed.userId).toBe(123);
      expect(parsed.action).toBe('failed_login');
    });

    it('should filter out undefined values from metadata', () => {
      const infoWithUndefined: WinstonLogInfo = {
        ...baseInfo,
        validField: 'valid',
        undefinedField: 'undefined',
        nullField: null,
      };

      const result = printfFormatMessage(infoWithUndefined);
      const parsed = JSON.parse(result);

      expect(parsed.validField).toBe('valid');
      expect(parsed.nullField).toBe('null');
      expect(parsed.undefinedField).toBeUndefined();
    });

    it('should handle splat parameter', () => {
      const infoWithSplat: WinstonLogInfo = {
        ...baseInfo,
        splat: true,
        extraData: 'should not be included',
      };

      const result = printfFormatMessage(infoWithSplat);
      expect(result).toBe('Test message');
    });
  });

  describe('printfFormatConsole', () => {
    const mockPid = process.pid;

    const baseInfo: WinstonLogInfo = {
      timestamp: '25-05-23 10:30:45.123',
      level: 'info',
      context: 'TestContext',
      ms: '+0ms',
      label: 'test-app',
      message: 'Test message',
    };

    it('should format console output correctly for info level', () => {
      const result = printfFormatConsole(baseInfo);

      expect(result).toContain('[test-app]');
      expect(result).toContain(mockPid.toString());
      expect(result).toContain('25-05-23 10:30:45.123');
      expect(result).toContain(' INFO');
      expect(result).toContain('[TestContext]');
      expect(result).toContain('Test message');
      expect(result).toContain('+0ms');
    });

    it('should format console output correctly for error level', () => {
      const errorInfo: WinstonLogInfo = {
        ...baseInfo,
        level: 'error',
        message: 'Error message',
      };

      const result = printfFormatConsole(errorInfo);

      expect(result).toContain('ERROR');
      expect(result).toContain('Error message');
      expect(result).toContain(colors.error);
    });

    it('should format console output correctly for warn level', () => {
      const warnInfo: WinstonLogInfo = {
        ...baseInfo,
        level: 'warn',
        message: 'Warning message',
      };

      const result = printfFormatConsole(warnInfo);

      expect(result).toContain(' WARN');
      expect(result).toContain('Warning message');
    });

    it('should format console output correctly for debug level', () => {
      const debugInfo: WinstonLogInfo = {
        ...baseInfo,
        level: 'debug',
        message: 'Debug message',
      };

      const result = printfFormatConsole(debugInfo);

      expect(result).toContain('DEBUG');
      expect(result).toContain('Debug message');
    });

    it('should format console output correctly for verbose level', () => {
      const verboseInfo: WinstonLogInfo = {
        ...baseInfo,
        level: 'verbose',
        message: 'Verbose message',
      };

      const result = printfFormatConsole(verboseInfo);

      expect(result).toContain('VERBOSE');
      expect(result).toContain('Verbose message');
    });

    it('should handle unknown log levels', () => {
      const unknownInfo: WinstonLogInfo = {
        ...baseInfo,
        level: 'unknown',
        message: 'Unknown level message',
      };

      const result = printfFormatConsole(unknownInfo);

      expect(result).toContain('UNKNOWN');
      expect(result).toContain('Unknown level message');
    });

    it('should pad level names correctly', () => {
      const infoResult = printfFormatConsole({ ...baseInfo, level: 'info' });
      const errorResult = printfFormatConsole({ ...baseInfo, level: 'error' });

      expect(infoResult).toContain(' INFO');
      expect(errorResult).toContain('ERROR');
    });
  });

  describe('printfFormatFile', () => {
    const mockPid = process.pid;

    const baseInfo: WinstonLogInfo = {
      timestamp: '25-05-23 10:30:45.123',
      level: 'info',
      context: 'TestContext',
      ms: '+0ms',
      label: 'test-app',
      message: 'Test message',
    };

    it('should format file output correctly', () => {
      const result = printfFormatFile(baseInfo);

      const expected = `25-05-23 10:30:45.123 ${mockPid}  INFO [TestContext] Test message +0ms`;
      expect(result).toBe(expected);
    });

    it('should format file output for different log levels', () => {
      const levels = ['error', 'warn', 'info', 'debug', 'verbose'];

      levels.forEach((level) => {
        const info: WinstonLogInfo = {
          ...baseInfo,
          level,
          message: `${level} message`,
        };

        const result = printfFormatFile(info);
        const levelUpper = level.toUpperCase().padStart(5, ' ');

        expect(result).toContain(levelUpper);
        expect(result).toContain(`${level} message`);
      });
    });

    it('should handle metadata in file format', () => {
      const infoWithMeta: WinstonLogInfo = {
        ...baseInfo,
        userId: 123,
        action: 'test',
      };

      const result = printfFormatFile(infoWithMeta);

      expect(result).toContain('userId');
      expect(result).toContain('123');
      expect(result).toContain('action');
      expect(result).toContain('test');
    });
  });

  describe('Winston Configuration', () => {
    let winstonConfig: any;

    beforeEach(async () => {
      // Import the default export
      const configModule = await import('./winston.config');
      winstonConfig = configModule.default;
    });

    it('should be a function that returns winston transports', () => {
      expect(typeof winstonConfig).toBe('function');

      const transports = winstonConfig();
      expect(Array.isArray(transports)).toBe(true);
      expect(transports).toHaveLength(3);
    });

    it('should create Console transport with correct configuration', () => {
      const transports = winstonConfig();
      const consoleTransport = transports[0];

      expect(consoleTransport).toBeInstanceOf(winston.transports.Console);
      expect(consoleTransport.format).toBeDefined();
    });

    it('should create DailyRotateFile transport for general logs', () => {
      const transports = winstonConfig();
      const fileTransport = transports[1];

      expect(fileTransport.dirname).toBe('logs');
      expect(fileTransport.filename).toBe('%DATE%.log');
      expect(fileTransport).toBeDefined();
    });

    it('should create DailyRotateFile transport for error logs', () => {
      const transports = winstonConfig();
      const errorTransport = transports[2];

      expect(errorTransport.dirname).toBe('logs');
      expect(errorTransport.filename).toBe('%DATE%.error.log');
      expect(errorTransport.level).toBe('error');
      expect(errorTransport).toBeDefined();
    });

    it('should register with correct config key', () => {
      expect(winstonConfig.KEY).toBe('CONFIGURATION(winston)');
    });
  });

  describe('Integration Tests', () => {
    let logger: winston.Logger;

    beforeEach(async () => {
      const configModule = await import('./winston.config');
      const transports = configModule.default();

      logger = winston.createLogger({
        level: 'verbose',
        transports,
      });
    });

    afterEach(() => {
      logger.close();
    });

    it('should log info messages correctly', (done) => {
      const mockWrite = jest.fn();

      // Mock console transport
      logger.transports[0].write = mockWrite;

      logger.info('Test info message', { context: 'TestContext' });

      setTimeout(() => {
        expect(mockWrite).toHaveBeenCalled();
        const loggedData = mockWrite.mock.calls[0][0];
        expect(loggedData.level).toBe('info');
        expect(loggedData.message).toBe('Test info message');
        expect(loggedData.context).toBe('TestContext');
        done();
      }, 10);
    });

    it('should log error messages with stack traces', (done) => {
      const mockWrite = jest.fn();
      const error = new Error('Test error');

      logger.transports[0].write = mockWrite;

      logger.error('Error occurred', { error, context: 'ErrorContext' });

      setTimeout(() => {
        expect(mockWrite).toHaveBeenCalled();
        const loggedData = mockWrite.mock.calls[0][0];
        expect(loggedData.level).toBe('error');
        expect(loggedData.message).toBe('Error occurred');
        expect(loggedData.context).toBe('ErrorContext');
        done();
      }, 10);
    });

    it('should log warn messages correctly', (done) => {
      const mockWrite = jest.fn();

      logger.transports[0].write = mockWrite;

      logger.warn('Warning message', { context: 'WarnContext', userId: 123 });

      setTimeout(() => {
        expect(mockWrite).toHaveBeenCalled();
        const loggedData = mockWrite.mock.calls[0][0];
        expect(loggedData.level).toBe('warn');
        expect(loggedData.message).toBe('Warning message');
        expect(loggedData.context).toBe('WarnContext');
        expect(loggedData.userId).toBe(123);
        done();
      }, 10);
    });

    it('should log debug messages correctly', (done) => {
      const mockWrite = jest.fn();

      logger.transports[0].write = mockWrite;

      logger.debug('Debug message', { context: 'DebugContext', data: { key: 'value' } });

      setTimeout(() => {
        expect(mockWrite).toHaveBeenCalled();
        const loggedData = mockWrite.mock.calls[0][0];
        expect(loggedData.level).toBe('debug');
        expect(loggedData.message).toBe('Debug message');
        expect(loggedData.context).toBe('DebugContext');
        done();
      }, 10);
    });

    it('should log verbose messages correctly', (done) => {
      const mockWrite = jest.fn();

      logger.transports[0].write = mockWrite;

      logger.verbose('Verbose message', { context: 'VerboseContext' });

      setTimeout(() => {
        expect(mockWrite).toHaveBeenCalled();
        const loggedData = mockWrite.mock.calls[0][0];
        expect(loggedData.level).toBe('verbose');
        expect(loggedData.message).toBe('Verbose message');
        expect(loggedData.context).toBe('VerboseContext');
        done();
      }, 10);
    });

    it('should handle complex objects in log messages', (done) => {
      const mockWrite = jest.fn();
      const complexObject = {
        user: { id: 123, name: 'John Doe' },
        action: 'login',
        timestamp: new Date().toISOString(),
        metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
      };

      logger.transports[0].write = mockWrite;

      logger.info('User action', { context: 'UserService', ...complexObject });

      setTimeout(() => {
        expect(mockWrite).toHaveBeenCalled();
        const loggedData = mockWrite.mock.calls[0][0];
        expect(loggedData.level).toBe('info');
        expect(loggedData.user).toEqual(complexObject.user);
        expect(loggedData.action).toBe(complexObject.action);
        done();
      }, 10);
    });

    it('should handle circular references safely', (done) => {
      const mockWrite = jest.fn();
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      logger.transports[0].write = mockWrite;

      // This should not throw an error
      logger.info('Circular reference test', { context: 'TestContext', data: circularObj });

      setTimeout(() => {
        expect(mockWrite).toHaveBeenCalled();
        const loggedData = mockWrite.mock.calls[0][0];
        expect(loggedData.level).toBe('info');
        expect(loggedData.message).toBe('Circular reference test');
        done();
      }, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', () => {
      const info: WinstonLogInfo = {
        timestamp: '25-05-23 10:30:45.123',
        level: 'info',
        context: 'TestContext',
        ms: '+0ms',
        label: 'test-app',
        message: '',
      };

      const consoleResult = printfFormatConsole(info);
      const fileResult = printfFormatFile(info);

      expect(consoleResult).toContain('');
      expect(fileResult).toContain('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000);
      const info: WinstonLogInfo = {
        timestamp: '25-05-23 10:30:45.123',
        level: 'info',
        context: 'TestContext',
        ms: '+0ms',
        label: 'test-app',
        message: longMessage,
      };

      const consoleResult = printfFormatConsole(info);
      const fileResult = printfFormatFile(info);

      expect(consoleResult).toContain(longMessage);
      expect(fileResult).toContain(longMessage);
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Message with 特殊字符 and émojis 🚀 and \n newlines \t tabs';
      const info: WinstonLogInfo = {
        timestamp: '25-05-23 10:30:45.123',
        level: 'info',
        context: 'TestContext',
        ms: '+0ms',
        label: 'test-app',
        message: specialMessage,
      };

      const consoleResult = printfFormatConsole(info);
      const fileResult = printfFormatFile(info);

      expect(consoleResult).toContain(specialMessage);
      expect(fileResult).toContain(specialMessage);
    });

    it('should handle missing context', () => {
      const info: WinstonLogInfo = {
        timestamp: '25-05-23 10:30:45.123',
        level: 'info',
        context: '',
        ms: '+0ms',
        label: 'test-app',
        message: 'Test message',
      };

      const consoleResult = printfFormatConsole(info);
      const fileResult = printfFormatFile(info);

      expect(consoleResult).toContain('[]');
      expect(fileResult).toContain('[]');
    });

    it('should handle missing timestamp', () => {
      const info: WinstonLogInfo = {
        timestamp: '',
        level: 'info',
        context: 'TestContext',
        ms: '+0ms',
        label: 'test-app',
        message: 'Test message',
      };

      const consoleResult = printfFormatConsole(info);
      const fileResult = printfFormatFile(info);

      expect(typeof consoleResult).toBe('string');
      expect(typeof fileResult).toBe('string');
    });
  });
});
