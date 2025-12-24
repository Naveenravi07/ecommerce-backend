import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './users/users.module';
import { AuthInfraModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    AuthInfraModule,
    DatabaseModule,
    UsersModule,
  ],
})
export class AppModule {}
