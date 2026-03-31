"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const session = require("express-session");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    const config = app.get(config_1.ConfigService);
    app.use(session({
        name: 'platform.sid',
        secret: config.get('SESSION_SECRET', 'dev-secret-change-in-production'),
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: config.get('SESSION_MAX_AGE_MS', 86400000),
        },
    }));
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    const frontendUrl = config.get('FRONTEND_URL', 'http://localhost:3000');
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
    });
    const { join } = require('path');
    const { NestExpressApplication } = require('@nestjs/platform-express');
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
    const port = config.get('BACKEND_PORT', 4000);
    await app.listen(port);
    const logger = app.get(nestjs_pino_1.Logger);
    logger.log(`🚀 Backend running at http://localhost:${port}/api/v1`);
    logger.log(`🔐 Auth endpoints at http://localhost:${port}/api/v1/auth`);
    logger.log(`📡 Health check at http://localhost:${port}/health`);
}
bootstrap();
//# sourceMappingURL=main.js.map