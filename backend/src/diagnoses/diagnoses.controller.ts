import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DiagnosesService } from './diagnoses.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole, DiagnosisStatus } from '@prisma/client';

/**
 * Diagnoses Controller: Admin endpoints for reviewing and approving diagnoses.
 * All endpoints require PLATFORM_ADMIN role.
 */
@Controller('diagnoses')
export class DiagnosesController {
  constructor(private readonly diagnosesService: DiagnosesService) {}

  /**
   * GET /api/v1/diagnoses
   * ADMIN — List all diagnoses with optional status filter.
   */
  @Get()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async listDiagnoses(
    @Query('status') status?: DiagnosisStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.diagnosesService.listDiagnoses(
      status,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /**
   * GET /api/v1/diagnoses/pending
   * ADMIN — Get diagnoses awaiting review (DRAFT_AI status).
   */
  @Get('pending')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getPendingDiagnoses() {
    return this.diagnosesService.getPendingDiagnoses();
  }

  /**
   * GET /api/v1/diagnoses/:id
   * ADMIN — Get a specific diagnosis with full details.
   */
  @Get(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getDiagnosis(@Param('id') id: string) {
    return this.diagnosesService.getDiagnosis(id);
  }

  /**
   * PATCH /api/v1/diagnoses/:id
   * ADMIN — Update diagnosis: approve or request revisions.
   *
   * Body:
   * {
   *   "status": "APPROVED" | "REVISION_REQUESTED" | "READY_FOR_CLIENT",
   *   "humanEditedContent": { ... },
   *   "clientFacingContent": { ... },
   *   "reviewerNotes": "...",
   *   "revisionNotes": "..."
   * }
   */
  @Patch(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async updateDiagnosis(
    @Param('id') id: string,
    @Body() params: {
      status?: DiagnosisStatus;
      humanEditedContent?: Record<string, any>;
      clientFacingContent?: Record<string, any>;
      reviewerNotes?: string;
      revisionNotes?: string;
    },
  ) {
    return this.diagnosesService.updateDiagnosis(id, params);
  }
}
