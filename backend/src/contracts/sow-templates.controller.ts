import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SowTemplatesService } from './sow-templates.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole, SowTemplateType } from '@prisma/client';

/**
 * SoW Templates Controller: Manage statement of work templates.
 * Admin-only endpoints for CRUD operations on SoW templates.
 */
@Controller('admin/sow-templates')
export class SowTemplatesController {
  constructor(private readonly sowTemplatesService: SowTemplatesService) {}

  /**
   * GET /api/v1/admin/sow-templates
   * ADMIN — List all active SoW templates, optionally filtered by type.
   */
  @Get()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getTemplates(@Query('type') type?: SowTemplateType) {
    return this.sowTemplatesService.getTemplates(
      type ? { type } : undefined,
    );
  }

  /**
   * GET /api/v1/admin/sow-templates/:id
   * ADMIN — Get a specific SoW template by ID.
   */
  @Get(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getTemplate(@Param('id') id: string) {
    return this.sowTemplatesService.getTemplate(id);
  }

  /**
   * PATCH /api/v1/admin/sow-templates/:id
   * ADMIN — Update a SoW template.
   *
   * Body:
   * {
   *   "name": "...",
   *   "description": "...",
   *   "contentPlainText": "...",
   *   "placeholders": [{name, description, required}, ...],
   *   "suggestedFeeMin": 2500,
   *   "suggestedFeeMax": 4000
   * }
   */
  @Patch(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async updateTemplate(
    @Param('id') id: string,
    @Body() updates: {
      name?: string;
      description?: string;
      contentPlainText?: string;
      placeholders?: any;
      suggestedFeeMin?: number;
      suggestedFeeMax?: number;
    },
  ) {
    return this.sowTemplatesService.updateTemplate(id, updates);
  }

  /**
   * POST /api/v1/admin/sow-templates/:id/duplicate
   * ADMIN — Duplicate a template with incremented version.
   */
  @Post(':id/duplicate')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async duplicateTemplate(@Param('id') id: string) {
    return this.sowTemplatesService.duplicateTemplate(id);
  }

  /**
   * POST /api/v1/admin/sow-templates/:id/deactivate
   * ADMIN — Deactivate a template (soft delete).
   */
  @Post(':id/deactivate')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async deactivateTemplate(@Param('id') id: string) {
    return this.sowTemplatesService.deactivateTemplate(id);
  }

  /**
   * POST /api/v1/admin/sow-templates/:id/extract-placeholders
   * ADMIN — Extract placeholders from template content.
   *
   * Body: { "contentPlainText": "..." }
   */
  @Post(':id/extract-placeholders')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async extractPlaceholders(@Body('contentPlainText') contentPlainText: string) {
    const placeholders = this.sowTemplatesService.extractPlaceholders(contentPlainText);
    return { placeholders };
  }

  /**
   * POST /api/v1/admin/sow-templates/:id/prefill
   * ADMIN — Pre-fill a SoW template with values pulled from a company's
   * approved opportunity brief + diagnosis. Returns the rendered content
   * and a values map for the editor.
   *
   * Body: { "applicationId": "..." }
   */
  @Post(':id/prefill')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async prefillSow(
    @Param('id') id: string,
    @Body('applicationId') applicationId: string,
  ) {
    return this.sowTemplatesService.prefillSowFromBrief({
      templateId: id,
      applicationId,
    });
  }
}
