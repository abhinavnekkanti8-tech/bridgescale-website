import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { ScheduleDiscoveryDto, AddNotesDto, OverrideDiscoveryDto } from './dto/discovery.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';
import { SessionUser as SessionUserDecorator } from '../auth/session-user.decorator';
import { SessionUser as SessionUserType } from '../common/types/session.types';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  /** POST /api/v1/discovery — Schedule a discovery call */
  @Post()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN, MembershipRole.STARTUP_ADMIN)
  schedule(
    @Body() dto: ScheduleDiscoveryDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.discoveryService.schedule(user, dto);
  }

  /** GET /api/v1/discovery — List all calls (admin) */
  @Get()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  findAll() {
    return this.discoveryService.findAll();
  }

  /** GET /api/v1/discovery/packages — Get available packages */
  @Get('packages')
  @UseGuards(SessionAuthGuard)
  getPackages() {
    return this.discoveryService.getPackages();
  }

  /** POST /api/v1/discovery/packages/seed — Seed default packages (admin) */
  @Post('packages/seed')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  seedPackages() {
    return this.discoveryService.seedPackages();
  }

  /** GET /api/v1/discovery/startup/:startupProfileId — Get startup's calls */
  @Get('startup/:startupProfileId')
  @UseGuards(SessionAuthGuard)
  findByStartup(
    @Param('startupProfileId') id: string,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.discoveryService.findByStartup(user, id);
  }

  /** GET /api/v1/discovery/:id — Get specific discovery call */
  @Get(':id')
  @UseGuards(SessionAuthGuard)
  findOne(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.discoveryService.findOne(user, id);
  }

  /** PATCH /api/v1/discovery/:id/cancel — Cancel a call */
  @Patch(':id/cancel')
  @UseGuards(SessionAuthGuard)
  cancel(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.discoveryService.cancel(user, id);
  }

  /** PATCH /api/v1/discovery/:id/complete — Mark call complete */
  @Patch(':id/complete')
  @UseGuards(SessionAuthGuard)
  complete(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.discoveryService.markCompleted(user, id);
  }

  /** POST /api/v1/discovery/:id/notes — Submit notes & trigger AI summary */
  @Post(':id/notes')
  @UseGuards(SessionAuthGuard)
  addNotes(
    @Param('id') id: string,
    @Body() dto: AddNotesDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.discoveryService.addNotes(user, id, dto);
  }

  /** PATCH /api/v1/discovery/:id/override — Admin override summary */
  @Patch(':id/override')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  overrideSummary(@Param('id') id: string, @Body() dto: OverrideDiscoveryDto) {
    return this.discoveryService.overrideSummary(id, dto);
  }
}
