import { Module, Res } from '@nestjs/common';
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
import { ResendService } from 'src/common/mail/resend/resend.service';
import { MailModule } from 'src/common/mail/mail.module';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    AuthModule.forRootAsync({
      imports: [DatabaseModule, LoggerModule,MailModule],
      inject: [DATABASE_CONNECTION, ConfigService, PinoLogger,ResendService],
      useFactory: (
        database: NodePgDatabase,
        config: ConfigService,
        logger: PinoLogger,
        resendService: ResendService
      ) => ({
        auth: betterAuth({
          database: drizzleAdapter(database, { provider: 'pg' }),

          trustedOrigins: [config.getOrThrow<string>('FRONTEND_URL')],
          secret: config.getOrThrow<string>('BETTER_AUTH_SECRET'),

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
            sendVerificationEmail: async ({ user, url }) => {
                resendService.sendEmailUsingTemplate(user.email, 'email-verification', { verificationUrl: url });
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
