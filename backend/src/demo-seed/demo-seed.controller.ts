import { Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { DemoSeedService } from './demo-seed.service';

/**
 * Admin-only endpoints for the Phase-2 clickable demo flow.
 *   GET    /api/v1/demo-seed         — surfaces credentials + dashboards
 *   POST   /api/v1/demo-seed         — wipes existing demo data and reseeds
 *   DELETE /api/v1/demo-seed         — wipes existing demo data
 */
@Controller('demo-seed')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(MembershipRole.PLATFORM_ADMIN)
export class DemoSeedController {
  constructor(private readonly service: DemoSeedService) {}

  @Get()
  credentials() {
    return this.service.credentials();
  }

  @Post()
  seed() {
    return this.service.seed();
  }

  @Delete()
  cleanup() {
    return this.service.cleanup();
  }
}
