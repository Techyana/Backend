import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  OpenAPIObject,
} from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Cookie parsing for JWT
  app.use(cookieParser());

  // Cookie-safe CORS
  app.enableCors({
    origin: ['https://ricohworkshopportal.co.za', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With', 'Cache-Control'],
  });

  // Validation + Global exception filter
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // Stub /notifications API to always return 200 OK with empty array
  app.use('/notifications', (_req, res) => {
    res.status(HttpStatus.OK).json([]);
  });

  // Swagger setup
  const bearerName = process.env.SWAGGER_BEARER_NAME || 'access-token';
  const config = new DocumentBuilder()
    .setTitle('Parts Management API')
    .setDescription('Endpoints to manage parts, claims, and users')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      bearerName
    )
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  // Expose JSON spec for CI / SDK generation
  app.getHttpAdapter().get('/api-docs-json', (_req, res) => {
    res.json(document);
  });

  // Write static spec to project root
  const outFile = path.resolve(process.cwd(), 'swagger-spec.json');
  fs.writeFileSync(outFile, JSON.stringify(document, null, 2));

  // Serve Swagger UI
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server up on http://0.0.0.0:${port}`);
}

bootstrap();
