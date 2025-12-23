import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { DATABASE_CONNECTION } from './database/database-connection';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    AuthModule.forRootAsync({
      imports: [DatabaseModule],
      useFactory: (database: NodePgDatabase, config: ConfigService) => ({
        auth: betterAuth({
          database: drizzleAdapter(database, {
            provider: 'pg',
          }),
          socialProviders: {
            github: {
              clientId: config.getOrThrow<string>('GITHUB_CLIENT_ID'),
              clientSecret: config.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
            },
            google: {
              clientId: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
              clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            },
          }
        })
      }),
      inject: [DATABASE_CONNECTION,ConfigService],
    }),
    UsersModule,
  ],

  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
})
export class AppModule { }
