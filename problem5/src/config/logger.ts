import { pino, type LoggerOptions } from 'pino';

import { env, isDevelopment } from './env.js';

const options: LoggerOptions = {
  level: env.LOG_LEVEL,
  base: { env: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.refreshToken',
    ],
    censor: '[REDACTED]',
  },
};

if (isDevelopment) {
  options.transport = {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l', ignore: 'pid,hostname,env' },
  };
}

export const logger = pino(options);
