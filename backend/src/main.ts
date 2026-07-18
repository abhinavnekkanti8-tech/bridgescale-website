import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as session from 'express-session';
import helmet from 'helmet';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { validateProductionConfig } from './config/production-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  // ── Structured logging via pino ──
  app.useLogger(app.get(Logger));
  const logger = app.get(Logger);

  // ── Security headers (helmet) ──
  // Sets HSTS, X-Content-Type-Options, X-Frame-Options, and related headers.
  app.use(helmet());

  const config = app.get(ConfigService);
  validateProductionConfig({
    ...process.env,
    SESSION_SECRET: config.get<string>('SESSION_SECRET'),
    DUMMY_PAYMENT_MODE: config.get<string>('DUMMY_PAYMENT_MODE'),
    STRIPE_WEBHOOK_SECRET: config.get<string>('STRIPE_WEBHOOK_SECRET'),
    STRIPE_SECRET_KEY: config.get<string>('STRIPE_SECRET_KEY'),
  });

  // ── Session store ──
  // Redis-backed when REDIS_URL is set, so sessions survive restarts and are
  // shared across instances. Falls back to the in-memory store only for local
  // dev without Redis; in production a missing/unreachable Redis is fatal
  // rather than a silent downgrade.
  const sessionStore = await createSessionStore(config, logger);

  app.use(
    session({
      name: 'platform.sid',
      store: sessionStore,
      secret: config.get<string>('SESSION_SECRET', 'dev-secret-change-in-production'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: Number(config.get<string>('SESSION_MAX_AGE_MS', '86400000')), // 24h default
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

  const port = config.get<number>('BACKEND_PORT', 4000);
  await app.listen(port);

  logger.log(`🚀 Backend running at http://localhost:${port}/api/v1`);
  logger.log(`🔐 Auth endpoints at http://localhost:${port}/api/v1/auth`);
  logger.log(`📡 Health check at http://localhost:${port}/api/v1/health`);
}

/**
 * Build the express-session store. Returns a Redis-backed store when REDIS_URL
 * is configured and reachable, otherwise `undefined` so express-session uses
 * its default in-memory store. In production, a configured-but-unreachable
 * Redis (or a missing REDIS_URL) is treated as a fatal misconfiguration.
 */
async function createSessionStore(
  config: ConfigService,
  logger: Logger,
): Promise<session.Store | undefined> {
  const redisUrl = config.get<string>('REDIS_URL');
  const isProduction = process.env.NODE_ENV === 'production';

  if (!redisUrl) {
    if (isProduction) {
      throw new Error(
        'REDIS_URL must be set in production — the in-memory session store is not safe for production.',
      );
    }
    logger.warn('REDIS_URL not set — using in-memory session store (dev only).');
    return undefined;
  }

  const redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err: Error) =>
    logger.error(`Redis session store error: ${err.message}`),
  );

  try {
    await redisClient.connect();
    logger.log('Session store: Redis');
    return new RedisStore({ client: redisClient, prefix: 'platform:sess:' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    try {
      redisClient.destroy();
    } catch {
      // client may already be closed after a failed connect — ignore
    }
    if (isProduction) {
      throw new Error(`Failed to connect to Redis session store at ${redisUrl}: ${message}`);
    }
    logger.warn(
      `Redis unavailable (${message}) — falling back to in-memory session store (dev only).`,
    );
    return undefined;
  }
}

bootstrap();
