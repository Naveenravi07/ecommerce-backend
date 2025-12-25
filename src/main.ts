import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { toNodeHandler } from 'better-auth/node';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { apiReference } from '@scalar/express-api-reference';
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

    const openApiDoc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Ecommerce API')
        .setVersion('1.0')
        .build(),
    );

    const cleaned = cleanupOpenApiDoc(openApiDoc);

    expressApp.get('/api/openapi.json', (_req, res) => {
      res.json(cleaned);
    });

    expressApp.use(
      '/api/docs',
      apiReference({
        url: '/api/openapi.json',
      }),
    );
  

  await app.listen(process.env.PORT || 8080);
}
bootstrap();