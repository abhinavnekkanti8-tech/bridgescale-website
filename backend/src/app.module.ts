import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { StartupsModule } from './startups/startups.module';
import { OperatorsModule } from './operators/operators.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { MatchingModule } from './matching/matching.module';
import { ContractsModule } from './contracts/contracts.module';
import { PaymentsModule } from './payments/payments.module';
import { EngagementsModule } from './engagements/engagements.module';
import { CloseoutModule } from './closeout/closeout.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ApplicationsModule } from './applications/applications.module';
import { EmailModule } from './email/email.module';
import { DiagnosesModule } from './diagnoses/diagnoses.module';
import { OpportunityBriefsModule } from './opportunity-briefs/opportunity-briefs.module';
import { TalentPreScreenModule } from './talent-pre-screen/talent-pre-screen.module';
import { ApplicationMatchingModule } from './application-matching/application-matching.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { SowModule } from './sow/sow.module';

@Module({
  imports: [
    // ── Environment config (available app-wide) ──
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Structured JSON logging (pino) ──
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { v4: uuidv4 } = require('uuid');
          return req.headers['x-correlation-id'] || uuidv4();
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),

    // ── PrismaModule (global DB client) ──
    PrismaModule,

    // ── Health check endpoint ──
    HealthModule,

    // ── Auth & Users ──
    AuthModule,
    UsersModule,

    // ── AI & Feature Modules ──
    AiModule,
    StartupsModule,
    OperatorsModule,
    DiscoveryModule,
    MatchingModule,
    ContractsModule,
    PaymentsModule,
    EngagementsModule,
    CloseoutModule,
    AnalyticsModule,
    ApplicationsModule,
    EmailModule,
    DiagnosesModule,
    OpportunityBriefsModule,
    TalentPreScreenModule,
    ApplicationMatchingModule,
    InterviewsModule,
    ApprovalsModule,
    SowModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

