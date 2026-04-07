import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SowService } from './sow.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

/**
 * SoW (Statement of Work) Controller: Manage engagement documents.
 * Generate, edit, and approve SoW documents for engagements.
 */
@Controller('sow')
export class SowController {
  constructor(private readonly sowService: SowService) {}

  /**
   * GET /api/v1/sow/templates
   * ADMIN — Get available SoW templates.
   */
  @Get('templates')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getTemplates() {
    return this.sowService.getTemplates();
  }

  /**
   * GET /api/v1/sow/templates/:templateId
   * ADMIN — Get a specific SoW template.
   */
  @Get('templates/:templateId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getTemplate(@Param('templateId') templateId: string) {
    return this.sowService.getTemplate(templateId);
  }

  /**
   * GET /api/v1/sow/:sowId
   * ADMIN — Get a SoW with all versions.
   */
  @Get(':sowId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getSoW(@Param('sowId') sowId: string) {
    return this.sowService.getSoW(sowId);
  }

  /**
   * POST /api/v1/sow/generate
   * ADMIN — Generate a SoW from a template.
   *
   * Body:
   * {
   *   "shortlistId": "...",
   *   "startupProfileId": "...",
   *   "operatorId": "...",
   *   "templateId": "...",
   *   "companyName": "Company XYZ",
   *   "talentName": "John Doe",
   *   "expectedDurationDays": 30,
   *   "feeUsd": 5000,
   *   "weeklyHours": 40,
   *   "packageType": "PIPELINE_SPRINT" | "BD_SPRINT" | "FRACTIONAL_RETAINER",
   *   "placeholderValues": { "[KEY]": "value" }
   * }
   */
  @Post('generate')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async generateSoW(
    @Body()
    params: {
      shortlistId: string;
      startupProfileId: string;
      operatorId: string;
      templateId: string;
      companyName: string;
      talentName: string;
      expectedDurationDays: number;
      feeUsd: number;
      weeklyHours?: number;
      packageType?: string;
      placeholderValues?: Record<string, string>;
    },
  ) {
    return this.sowService.generateSoW(params as any);
  }

  /**
   * PATCH /api/v1/sow/:sowId
   * ADMIN — Update SoW content and create new version.
   *
   * Body: { "contentText": "...", "changedBy": "user-id", "changeNote": "optional" }
   */
  @Patch(':sowId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async updateSoW(
    @Param('sowId') sowId: string,
    @Body() body: { contentText: string; changedBy: string; changeNote?: string },
  ) {
    return this.sowService.updateSoW(sowId, body.contentText, body.changedBy, body.changeNote);
  }

  /**
   * POST /api/v1/sow/:sowId/approve
   * ADMIN — Approve SoW for signing.
   */
  @Post(':sowId/approve')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async approveSoW(@Param('sowId') sowId: string) {
    return this.sowService.approveSoW(sowId);
  }
}
