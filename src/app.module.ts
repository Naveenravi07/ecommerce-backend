import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './users/users.module';
import { AuthInfraModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { QueueModule } from './common/queue/queue.module';
import { EmailQueueModule } from './common/queue/email/email-queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    DatabaseModule,
    QueueModule,
    EmailQueueModule,
    AuthInfraModule,
    UsersModule,
  ],
})
export class AppModule {}
