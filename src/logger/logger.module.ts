import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        name: 'ecom-api',
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

        genReqId: (req) =>
          req.headers['x-request-id'] || randomUUID(),

        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  singleLine: true,
                },
              }
            : undefined,

        redact: {
          paths: [
            'req.headers.authorization',          ],
          censor: '[REDACTED]',
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
