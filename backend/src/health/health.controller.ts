import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '../common/enums/role.enum';
import { SessionUser } from '../auth/session-user.decorator';
import { CreateEscalationDto, UpdateEscalationDto, CreateNudgeDto } from './dto/health.dto';

interface ServiceStatus {
  status: 'up' | 'down';
  latencyMs?: number;
  error?: string;
}

interface HealthResult {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
  };
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly healthService: HealthService,
  ) {}

  @Get()
  async check(): Promise<HealthResult> {
    const result: HealthResult = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: { status: 'up' },
      },
    };

    // ── Database ping ──
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      result.services.database = { status: 'up', latencyMs: Date.now() - start };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      result.services.database = { status: 'down', error: message };
      result.status = 'degraded';
    }

    return result;
  }

  // ── Snapshots & Scoring ────────────────────────────────────────────────

  @Get('engagements/:id/snapshots')
  @UseGuards(SessionAuthGuard, RolesGuard)
  getSnapshots(@Param('id') id: string) {
    return this.healthService.getAllSnapshots(id);
  }

  @Post('engagements/:id/recalculate')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  recalculate(@Param('id') id: string) {
    return this.healthService.recalculateHealth(id);
  }

  // ── Nudges ─────────────────────────────────────────────────────────────

  @Get('nudges')
  @UseGuards(SessionAuthGuard)
  getMyNudges(@SessionUser() user: any) {
    return this.healthService.getMyNudges(user.id);
  }

  @Patch('nudges/:id/read')
  @UseGuards(SessionAuthGuard)
  markNudgeRead(@Param('id') id: string) {
    return this.healthService.markNudgeRead(id);
  }

  @Post('engagements/:id/nudges')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  createNudge(@Param('id') id: string, @Body() dto: CreateNudgeDto) {
    return this.healthService.createNudge(id, dto);
  }

  // ── Escalations ────────────────────────────────────────────────────────

  @Post('escalate')
  @UseGuards(SessionAuthGuard)
  createEscalation(@Body() dto: CreateEscalationDto, @SessionUser() user: any) {
    return this.healthService.createEscalation(user.id, dto);
  }

  @Get('escalations')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  getOpenEscalations() {
    return this.healthService.getOpenEscalations();
  }

  @Patch('escalations/:id/status')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  updateEscalationStatus(@Param('id') id: string, @Body() dto: UpdateEscalationDto) {
    return this.healthService.updateEscalationStatus(id, dto);
  }
}
