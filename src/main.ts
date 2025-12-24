import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { toNodeHandler } from 'better-auth/node';
import { AuthService } from '@thallesp/nestjs-better-auth';
const cors = require('cors');


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const expressApp = app.getHttpAdapter().getInstance();

  const authService = app.get<AuthService>(AuthService);
  expressApp.all(
    /^\/api\/auth\/.*/,
    toNodeHandler(authService.instance.handler),
  );

  expressApp.use(require('express').json());

  
  app.setGlobalPrefix('api');
  app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }))

  await app.listen(process.env.PORT || 8080);
}
bootstrap();