import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import {
  CancelSowDto,
  FindOrCreateMsaDto,
  GenerateSowDto,
  GenerateSowFromSummaryDto,
  EditSowDto,
  SignContractDto,
  SignMsaDto,
} from './dto/contracts.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';
import { SessionUser as SessionUserDecorator } from '../auth/session-user.decorator';
import { SessionUser as SessionUserType } from '../common/types/session.types';
import { MsaService } from './msa.service';

@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly msaService: MsaService,
  ) {}

  /** POST /api/v1/contracts/sow — Generate SoW */
  @Post('sow')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  generateSow(@Body() dto: GenerateSowDto) {
    return this.contractsService.generateSow(dto);
  }

  /** POST /api/v1/contracts/sow/from-summary — Generate SOW from confirmed Pre-SOW Summary */
  @Post('sow/from-summary')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  generateSowFromSummary(@Body() dto: GenerateSowFromSummaryDto) {
    return this.contractsService.generateSowFromSummary(dto.summaryId);
  }

  /** GET /api/v1/contracts/sow — List all SoWs (admin) */
  @Get('sow')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  findAll() {
    return this.contractsService.findAll();
  }

  /** GET /api/v1/contracts/sow/:id — Get SoW with versions */
  @Get('sow/:id')
  @UseGuards(SessionAuthGuard)
  findOneSow(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.contractsService.findOneSow(user, id);
  }

  /** GET /api/v1/contracts/sow/:id/versions — Get SoW version history */
  @Get('sow/:id/versions')
  @UseGuards(SessionAuthGuard)
  getSowVersions(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.contractsService.getSowVersions(user, id);
  }

  /** PATCH /api/v1/contracts/sow/:id — Edit SoW (creates new version) */
  @Patch('sow/:id')
  @UseGuards(SessionAuthGuard)
  editSow(@Param('id') id: string, @Body() dto: EditSowDto, @SessionUserDecorator() user: SessionUserType) {
    return this.contractsService.editSow(id, dto, user);
  }

  /** PATCH /api/v1/contracts/sow/:id/submit — Submit for review */
  @Patch('sow/:id/submit')
  @UseGuards(SessionAuthGuard)
  submitForReview(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.contractsService.submitForReview(id, user);
  }

  /** PATCH /api/v1/contracts/sow/:id/approve — Approve SoW, create contract */
  @Patch('sow/:id/approve')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  approveSow(@Param('id') id: string) {
    return this.contractsService.approveSow(id);
  }

  /** POST /api/v1/contracts/sow/:id/cancel — Record cancellation tracking event */
  @Post('sow/:id/cancel')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  cancelSow(@Param('id') id: string, @Body() dto: CancelSowDto) {
    return this.contractsService.cancelSow(id, dto);
  }

  /** POST /api/v1/contracts/msa/find-or-create — Find or create pair-level MSA */
  @Post('msa/find-or-create')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  findOrCreateMsa(@Body() dto: FindOrCreateMsaDto) {
    return this.msaService.findOrCreateMsa(dto);
  }

  /** PATCH /api/v1/contracts/msa/:id/sign — Record manual MSA signature */
  @Patch('msa/:id/sign')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  signMsa(@Param('id') id: string, @Body() dto: SignMsaDto) {
    return this.msaService.recordSignature(id, dto.party, dto.signatureId);
  }

  /** GET /api/v1/contracts/sow/startup/:startupProfileId */
  @Get('sow/startup/:startupProfileId')
  @UseGuards(SessionAuthGuard)
  findByStartup(@Param('startupProfileId') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.contractsService.findByStartup(user, id);
  }

  /** GET /api/v1/contracts/sow/operator/:operatorId */
  @Get('sow/operator/:operatorId')
  @UseGuards(SessionAuthGuard)
  findByOperator(@Param('operatorId') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.contractsService.findByOperator(user, id);
  }

  // ── Contract / Signature endpoints ────────────────────────────────────

  /** GET /api/v1/contracts/:id — Get contract */
  @Get(':id')
  @UseGuards(SessionAuthGuard)
  findOneContract(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.contractsService.findOneContract(user, id);
  }

  /** POST /api/v1/contracts/:id/sign/startup — Startup signs */
  @Post(':id/sign/startup')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.PLATFORM_ADMIN)
  signStartup(
    @Param('id') id: string,
    @Body() dto: SignContractDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.contractsService.signContract(id, user, 'STARTUP', dto);
  }

  /** POST /api/v1/contracts/:id/sign/operator — Operator signs */
  @Post(':id/sign/operator')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  signOperator(
    @Param('id') id: string,
    @Body() dto: SignContractDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.contractsService.signContract(id, user, 'OPERATOR', dto);
  }

  /** PATCH /api/v1/contracts/:id/unlock-contacts — Unlock contacts */
  @Patch(':id/unlock-contacts')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  unlockContacts(@Param('id') id: string) {
    return this.contractsService.unlockContacts(id);
  }

  /** GET /api/v1/contracts/:id/logs — Get document audit logs */
  @Get(':id/logs')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  getDocumentLogs(@Param('id') id: string) {
    return this.contractsService.getDocumentLogs(id);
  }

  /** POST /api/v1/contracts/:id/log-download — Log document download */
  @Post(':id/log-download')
  @UseGuards(SessionAuthGuard)
  logDownload(
    @Param('id') id: string,
    @Req() req: { ip?: string; headers?: Record<string, string> },
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.contractsService.logDownload(
      id,
      user,
      req.ip,
      req.headers?.['user-agent'],
    );
  }
}
