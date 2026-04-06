"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const app_controller_1 = require("./app.controller");
const prisma_module_1 = require("./prisma/prisma.module");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const ai_module_1 = require("./ai/ai.module");
const startups_module_1 = require("./startups/startups.module");
const operators_module_1 = require("./operators/operators.module");
const discovery_module_1 = require("./discovery/discovery.module");
const matching_module_1 = require("./matching/matching.module");
const contracts_module_1 = require("./contracts/contracts.module");
const payments_module_1 = require("./payments/payments.module");
const engagements_module_1 = require("./engagements/engagements.module");
const closeout_module_1 = require("./closeout/closeout.module");
const analytics_module_1 = require("./analytics/analytics.module");
const applications_module_1 = require("./applications/applications.module");
const email_module_1 = require("./email/email.module");
const diagnoses_module_1 = require("./diagnoses/diagnoses.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    genReqId: (req) => {
                        const { v4: uuidv4 } = require('uuid');
                        return req.headers['x-correlation-id'] || uuidv4();
                    },
                    transport: process.env.NODE_ENV !== 'production'
                        ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
                        : undefined,
                    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
                    redact: ['req.headers.authorization', 'req.headers.cookie'],
                },
            }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            ai_module_1.AiModule,
            startups_module_1.StartupsModule,
            operators_module_1.OperatorsModule,
            discovery_module_1.DiscoveryModule,
            matching_module_1.MatchingModule,
            contracts_module_1.ContractsModule,
            payments_module_1.PaymentsModule,
            engagements_module_1.EngagementsModule,
            closeout_module_1.CloseoutModule,
            analytics_module_1.AnalyticsModule,
            applications_module_1.ApplicationsModule,
            email_module_1.EmailModule,
            diagnoses_module_1.DiagnosesModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map