import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as session from 'express-session';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ── Structured logging via pino ──
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);

  // ── Session middleware (express-session) ──
  // NOTE: For production, replace MemoryStore with a persistent store
  // (e.g. connect-redis or connect-pg-simple) to support multi-instance scaling.
  app.use(
    session({
      name: 'platform.sid',
      secret: config.get<string>('SESSION_SECRET', 'dev-secret-change-in-production'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: config.get<number>('SESSION_MAX_AGE_MS', 86400000), // 24h default
      },
    }),
  );

  // ── Global prefix for all REST routes ──
  app.setGlobalPrefix('api/v1');

  // ── Validation: strip unknown fields, auto-transform types ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Global exception filter ──
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── CORS ──
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // ── Serve uploaded files statically ──
  (app as any).useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  const port = config.get<number>('BACKEND_PORT', 4000);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`🚀 Backend running at http://localhost:${port}/api/v1`);
  logger.log(`🔐 Auth endpoints at http://localhost:${port}/api/v1/auth`);
  logger.log(`📡 Health check at http://localhost:${port}/health`);
}

bootstrap();
