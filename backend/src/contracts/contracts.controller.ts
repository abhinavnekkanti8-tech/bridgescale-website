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
import { GenerateSowDto, EditSowDto, SignContractDto } from './dto/contracts.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /** POST /api/v1/contracts/sow — Generate SoW */
  @Post('sow')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  generateSow(@Body() dto: GenerateSowDto) {
    return this.contractsService.generateSow(dto);
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
  findOneSow(@Param('id') id: string) {
    return this.contractsService.findOneSow(id);
  }

  /** GET /api/v1/contracts/sow/:id/versions — Get SoW version history */
  @Get('sow/:id/versions')
  @UseGuards(SessionAuthGuard)
  getSowVersions(@Param('id') id: string) {
    return this.contractsService.getSowVersions(id);
  }

  /** PATCH /api/v1/contracts/sow/:id — Edit SoW (creates new version) */
  @Patch('sow/:id')
  @UseGuards(SessionAuthGuard)
  editSow(@Param('id') id: string, @Body() dto: EditSowDto, @Req() req: { user?: { id?: string } }) {
    return this.contractsService.editSow(id, dto, req.user?.id ?? 'unknown');
  }

  /** PATCH /api/v1/contracts/sow/:id/submit — Submit for review */
  @Patch('sow/:id/submit')
  @UseGuards(SessionAuthGuard)
  submitForReview(@Param('id') id: string) {
    return this.contractsService.submitForReview(id);
  }

  /** PATCH /api/v1/contracts/sow/:id/approve — Approve SoW, create contract */
  @Patch('sow/:id/approve')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  approveSow(@Param('id') id: string) {
    return this.contractsService.approveSow(id);
  }

  /** GET /api/v1/contracts/sow/startup/:startupProfileId */
  @Get('sow/startup/:startupProfileId')
  @UseGuards(SessionAuthGuard)
  findByStartup(@Param('startupProfileId') id: string) {
    return this.contractsService.findByStartup(id);
  }

  /** GET /api/v1/contracts/sow/operator/:operatorId */
  @Get('sow/operator/:operatorId')
  @UseGuards(SessionAuthGuard)
  findByOperator(@Param('operatorId') id: string) {
    return this.contractsService.findByOperator(id);
  }

  // ── Contract / Signature endpoints ────────────────────────────────────

  /** GET /api/v1/contracts/:id — Get contract */
  @Get(':id')
  @UseGuards(SessionAuthGuard)
  findOneContract(@Param('id') id: string) {
    return this.contractsService.findOneContract(id);
  }

  /** POST /api/v1/contracts/:id/sign/startup — Startup signs */
  @Post(':id/sign/startup')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.PLATFORM_ADMIN)
  signStartup(@Param('id') id: string, @Body() dto: SignContractDto) {
    return this.contractsService.signContract(id, 'STARTUP', dto);
  }

  /** POST /api/v1/contracts/:id/sign/operator — Operator signs */
  @Post(':id/sign/operator')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  signOperator(@Param('id') id: string, @Body() dto: SignContractDto) {
    return this.contractsService.signContract(id, 'OPERATOR', dto);
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
  logDownload(@Param('id') id: string, @Req() req: { user?: { id?: string }; ip?: string; headers?: Record<string, string> }) {
    return this.contractsService.logDocumentAction(id, 'DOWNLOAD', req.user?.id ?? 'unknown', req.ip, req.headers?.['user-agent']);
  }
}
