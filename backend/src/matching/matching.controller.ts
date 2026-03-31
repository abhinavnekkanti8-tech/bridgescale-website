import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MatchingService } from './matching.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  /** POST /api/v1/matching/generate/:startupProfileId — Generate shortlist */
  @Post('generate/:startupProfileId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  generateShortlist(@Param('startupProfileId') id: string) {
    return this.matchingService.generateShortlist(id);
  }

  /** GET /api/v1/matching — List all shortlists (admin) */
  @Get()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  findAll() {
    return this.matchingService.findAll();
  }

  /** GET /api/v1/matching/startup/:startupProfileId — Get startup's shortlists */
  @Get('startup/:startupProfileId')
  @UseGuards(SessionAuthGuard)
  findByStartup(@Param('startupProfileId') id: string) {
    return this.matchingService.findByStartup(id);
  }

  /** GET /api/v1/matching/:id — Get specific shortlist */
  @Get(':id')
  @UseGuards(SessionAuthGuard)
  findOne(@Param('id') id: string) {
    return this.matchingService.findOne(id);
  }

  /** PATCH /api/v1/matching/:id/publish — Publish shortlist to startup */
  @Patch(':id/publish')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  publish(@Param('id') id: string) {
    return this.matchingService.publishShortlist(id);
  }

  /** PATCH /api/v1/matching/candidate/:candidateId/respond — Operator accepts/declines */
  @Patch('candidate/:candidateId/respond')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.OPERATOR)
  operatorRespond(
    @Param('candidateId') id: string,
    @Body() body: { interest: 'ACCEPTED' | 'DECLINED'; declineReason?: string },
  ) {
    return this.matchingService.operatorRespond(id, body.interest, body.declineReason);
  }

  /** PATCH /api/v1/matching/:id/select/:candidateId — Startup selects operator */
  @Patch(':id/select/:candidateId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.PLATFORM_ADMIN)
  selectOperator(
    @Param('id') shortlistId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.matchingService.selectOperator(shortlistId, candidateId);
  }
}
