import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import {
  GenerateSowDto,
  GenerateEquitySowDto,
  EditSowDto,
  SignContractDto,
  RecordVestingDto,
  SetEquityDocRefDto,
  EquityEventDto,
} from './dto/contracts.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionUser } from '../common/types/session.types';
import { MembershipRole } from '@prisma/client';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  // ── Standard SOW ─────────────────────────────────────────────────────────

  /** POST /api/v1/contracts/sow — Generate standard SoW (admin) */
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
  editSow(
    @Param('id') id: string,
    @Body() dto: EditSowDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.contractsService.editSow(id, dto, user?.id ?? 'unknown');
  }

  /** PATCH /api/v1/contracts/sow/:id/submit — Submit for review */
  @Patch('sow/:id/submit')
  @UseGuards(SessionAuthGuard)
  submitForReview(@Param('id') id: string) {
    return this.contractsService.submitForReview(id);
  }

  /**
   * PATCH /api/v1/contracts/sow/:id/approve — Approve SoW, create Contract.
   * For HYBRID_EQUITY SOWs this will fail unless both legal-ack gates pass
   * and (if required) equity review has been approved.
   */
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

  // ── Equity SOW ───────────────────────────────────────────────────────────

  /**
   * POST /api/v1/contracts/sow/equity — Generate a HYBRID_EQUITY SOW (admin).
   * Body: GenerateEquitySowDto (includes equity terms: type, value, vesting).
   * Auto-flags equityReviewRequired when thresholds are exceeded.
   */
  @Post('sow/equity')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  generateEquitySow(@Body() dto: GenerateEquitySowDto) {
    return this.contractsService.generateEquitySow(dto);
  }

  /**
   * POST /api/v1/contracts/sow/:id/acknowledge-legal
   * Startup or Operator acknowledges equity legal risk clause.
   * Both parties must call this before the SOW can be approved.
   * PLATFORM_ADMIN can acknowledge on behalf of either or both parties
   * (body not required — role is derived from session membership).
   */
  @Post('sow/:id/acknowledge-legal')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  acknowledgeEquityLegal(
    @Param('id') id: string,
    @CurrentUser() user: SessionUser,
  ) {
    // Map session role to contract role
    const role = this.resolveEquityRole(user);
    return this.contractsService.acknowledgeEquityLegal(id, role);
  }

  /**
   * POST /api/v1/contracts/sow/:id/request-equity-review
   * Either party requests mandatory admin equity review.
   * Once triggered, the review gate cannot be bypassed without admin approval.
   */
  @Post('sow/:id/request-equity-review')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  requestEquityReview(@Param('id') id: string) {
    return this.contractsService.requestEquityReview(id);
  }

  /**
   * POST /api/v1/contracts/sow/:id/approve-equity-review
   * Admin: approve the equity review gate, unblocking SOW approval.
   */
  @Post('sow/:id/approve-equity-review')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN, MembershipRole.DEAL_DESK)
  approveEquityReview(@Param('id') id: string) {
    return this.contractsService.approveEquityReview(id);
  }

  // ── Contract / Signature endpoints ────────────────────────────────────────

  /** GET /api/v1/contracts/:id — Get contract (includes equityGrant if present) */
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
  logDownload(
    @Param('id') id: string,
    @CurrentUser() user: SessionUser,
    @Req() req: { ip?: string; headers?: Record<string, string> },
  ) {
    return this.contractsService.logDocumentAction(
      id,
      'DOWNLOAD',
      user?.id ?? 'unknown',
      req.ip,
      req.headers?.['user-agent'],
    );
  }

  // ── Equity Grant lifecycle ────────────────────────────────────────────────

  /**
   * PATCH /api/v1/contracts/:id/equity-doc
   * Admin: set the external URL for the FAST agreement / equity side-letter.
   * Called after the document is countersigned outside the platform.
   */
  @Patch(':id/equity-doc')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN, MembershipRole.DEAL_DESK)
  setEquityDocumentRef(
    @Param('id') id: string,
    @Body() dto: SetEquityDocRefDto,
  ) {
    return this.contractsService.setEquityDocumentRef(id, dto);
  }

  /**
   * GET /api/v1/contracts/:id/equity-grant
   * Startup, operator, or admin: get the current equity grant status and vesting.
   */
  @Get(':id/equity-grant')
  @UseGuards(SessionAuthGuard)
  getEquityGrant(@Param('id') id: string) {
    return this.contractsService.getEquityGrant(id);
  }

  /**
   * POST /api/v1/contracts/:id/equity-grant/activate
   * Admin: activate vesting — transitions PENDING → ACTIVE, sets vestingStartDate.
   * Called when the engagement formally starts.
   */
  @Post(':id/equity-grant/activate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  activateEquityGrant(@Param('id') id: string) {
    return this.contractsService.activateEquityGrant(id);
  }

  /**
   * POST /api/v1/contracts/:id/equity-grant/vest
   * Admin: record a vesting checkpoint.
   * Body: { vestedPct: number (cumulative 0–100), notes?: string }
   */
  @Post(':id/equity-grant/vest')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  recordVestingEvent(
    @Param('id') id: string,
    @Body() dto: RecordVestingDto,
  ) {
    return this.contractsService.recordVestingEvent(id, dto);
  }

  /**
   * POST /api/v1/contracts/:id/equity-grant/lapse
   * Admin: lapse unvested equity on termination.
   * Vested equity is retained; unvested lapses.
   * Body: { notes: string } — required, e.g. "Engagement terminated by startup on 2026-07-01"
   */
  @Post(':id/equity-grant/lapse')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  lapseEquityGrant(
    @Param('id') id: string,
    @Body() dto: EquityEventDto,
  ) {
    return this.contractsService.lapseEquityGrant(id, dto);
  }

  /**
   * POST /api/v1/contracts/:id/equity-grant/accelerate
   * Admin: accelerate full vesting (acquisition, IPO, or mutual agreement).
   * Sets vestedPct to 100 regardless of schedule.
   * Body: { notes: string } — required, e.g. "Company acquired by Acme Corp"
   */
  @Post(':id/equity-grant/accelerate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  accelerateEquityGrant(
    @Param('id') id: string,
    @Body() dto: EquityEventDto,
  ) {
    return this.contractsService.accelerateEquityGrant(id, dto);
  }

  /**
   * POST /api/v1/contracts/:id/equity-grant/dummy-vest
   * DUMMY MODE ONLY — simulates cliff vesting for local testing.
   * Requires DUMMY_PAYMENT_MODE=true. Returns 400 in production.
   */
  @Post(':id/equity-grant/dummy-vest')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  dummyVestGrant(@Param('id') id: string) {
    return this.contractsService.dummyVestGrant(id);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Resolve session membership role to the equity acknowledgment role string.
   * STARTUP_ADMIN → 'STARTUP', OPERATOR → 'OPERATOR', PLATFORM_ADMIN → 'PLATFORM_ADMIN'.
   */
  private resolveEquityRole(
    user: SessionUser,
  ): 'STARTUP' | 'OPERATOR' | 'PLATFORM_ADMIN' {
    if (!user) return 'STARTUP'; // fallback; guard prevents unauthenticated access
    if (user.role === 'PLATFORM_ADMIN') return 'PLATFORM_ADMIN';
    if (user.role === 'OPERATOR') return 'OPERATOR';
    return 'STARTUP'; // STARTUP_ADMIN, STARTUP_MEMBER
  }
}
