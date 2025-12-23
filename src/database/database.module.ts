import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database-connection';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres'
import { LoggerModule } from 'src/logger/logger.module';
import { PinoLogger } from 'nestjs-pino';
import * as AuthSchema from 'src/auth/schema';

@Module({
    imports: [LoggerModule],
    providers: [
        {
            provide: DATABASE_CONNECTION,
            useFactory: async(configModule: ConfigService,logger:PinoLogger) =>{

                const pool = new Pool({
                    connectionString: configModule.getOrThrow<string>('DATABASE_URL'),
                })

                try{
                    await pool.query('SELECT 1');
                    logger.info('PostgreSQL connected successfully');
                }catch(err){
                    logger.error('PostgreSQL connection failed', err);
                }

                return drizzle(pool,{
                    schema: {
                        ...AuthSchema
                    },
                })
            },
            inject: [ConfigService,PinoLogger],
        }
    ],
    exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
