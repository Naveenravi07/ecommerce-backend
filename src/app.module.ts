import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './users/users.module';
import { AuthInfraModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { QueueModule } from './common/queue/queue.module';
import { EmailQueueModule } from './common/queue/email/email-queue.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { AdminModule } from './admin/admin.module';
import { UploadsModule } from './uploads/uploads.module';
import { ApiResponseInterceptor } from './common/http/api-response.interceptor';
import { ApiExceptionFilter } from './common/http/api-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    DatabaseModule,
    QueueModule,
    EmailQueueModule,
    AuthInfraModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    AdminModule,
    UploadsModule,
  ],
  providers:[
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    }
  ]
})
export class AppModule {}
