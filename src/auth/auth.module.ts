import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../logger/logger.module';
import { APP_GUARD } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';
import { buildVerifyEmailHtml } from 'src/common/mail/templates/verify-email';
import { openAPI } from 'better-auth/plugins';
import { EmailQueueService } from 'src/common/queue/email/email-queue.service';
import { EmailQueueModule } from 'src/common/queue/email/email-queue.module';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    AuthModule.forRootAsync({
      imports: [DatabaseModule, LoggerModule, EmailQueueModule],
      inject: [DATABASE_CONNECTION, ConfigService, PinoLogger, EmailQueueService],
      useFactory: (
        database: NodePgDatabase,
        config: ConfigService,
        logger: PinoLogger,
        emailQueueService: EmailQueueService,
      ) => ({
        auth: betterAuth({
          database: drizzleAdapter(database, { provider: 'pg' }),
          trustedOrigins: [config.getOrThrow<string>('FRONTEND_URL')],
          secret: config.getOrThrow<string>('BETTER_AUTH_SECRET'),
          plugins:[openAPI()],
          logger: {
            disabled: !isDev,
            level: isDev ? 'info' : 'error',
            log: (level, message, meta) => {
              if (level === 'error') {
                logger.error({ meta }, `[BetterAuth] ${message}`);
              } else if (isDev) {
                logger.info({ meta }, `[BetterAuth] ${message}`);
              }
            },
          },

          emailAndPassword: {
            enabled: true,
            requireEmailVerification: true,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: false,
          },

          socialProviders: {
            github: {
              clientId: config.getOrThrow('GITHUB_CLIENT_ID'),
              clientSecret: config.getOrThrow('GITHUB_CLIENT_SECRET'),
            },
            google: {
              clientId: config.getOrThrow('GOOGLE_CLIENT_ID'),
              clientSecret: config.getOrThrow('GOOGLE_CLIENT_SECRET'),
            },
          },

          emailVerification: {
            sendVerificationEmail: async ({ user, url, token }) => {
              const html = buildVerifyEmailHtml({
                logoUrl: config.getOrThrow('LOGO_URL'),
                companyName: config.getOrThrow('COMPANY_NAME'),
                verificationUrl: url,
              });
              
              await emailQueueService.addEmailJob({
                to: user.email,
                subject: 'Please verify your email',
                html,
              });
            },
          },

        }),
      }),
    }),
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],

  exports: [AuthModule],
})
export class AuthInfraModule {}
