import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SowTemplateType } from '@prisma/client';

/**
 * SoW Templates Service: Manage statement of work templates.
 * CRUD operations for admin-managed templates used in contract generation.
 */
@Injectable()
export class SowTemplatesService {
  private readonly logger = new Logger(SowTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active SoW templates.
   */
  async getTemplates(filter?: { type?: SowTemplateType }) {
    const templates = await this.prisma.sowTemplate.findMany({
      where: {
        isActive: true,
        ...(filter?.type ? { templateType: filter.type } : {}),
      },
      orderBy: [{ templateType: 'asc' }, { version: 'desc' }],
    });

    return templates;
  }

  /**
   * Get a specific SoW template by ID.
   */
  async getTemplate(templateId: string) {
    const template = await this.prisma.sowTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('SoW template not found.');
    }

    return template;
  }

  /**
   * Update a SoW template (admin only).
   */
  async updateTemplate(templateId: string, updates: {
    name?: string;
    description?: string;
    contentPlainText?: string;
    placeholders?: any;
    suggestedFeeMin?: number;
    suggestedFeeMax?: number;
  }) {
    const template = await this.prisma.sowTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('SoW template not found.');
    }

    const updated = await this.prisma.sowTemplate.update({
      where: { id: templateId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`SoW template updated: ${templateId} (${template.name})`);
    return updated;
  }

  /**
   * Duplicate a SoW template with incremented version.
   */
  async duplicateTemplate(templateId: string) {
    const template = await this.prisma.sowTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('SoW template not found.');
    }

    // Create a new version with incremented version number
    const newVersion = template.version + 1;
    const newSlug = `${template.slug}-v${newVersion}`;

    const duplicated = await this.prisma.sowTemplate.create({
      data: {
        slug: newSlug,
        name: `${template.name} (v${newVersion})`,
        templateType: template.templateType,
        version: newVersion,
        description: template.description,
        contentPlainText: template.contentPlainText,
        placeholders: template.placeholders || {},
        durationDays: template.durationDays,
        suggestedFeeMin: template.suggestedFeeMin,
        suggestedFeeMax: template.suggestedFeeMax,
        currency: template.currency,
        isActive: true,
      },
    });

    this.logger.log(`SoW template duplicated: ${templateId} → ${duplicated.id} (v${newVersion})`);
    return duplicated;
  }

  /**
   * Deactivate a template (soft delete).
   */
  async deactivateTemplate(templateId: string) {
    const template = await this.prisma.sowTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('SoW template not found.');
    }

    const updated = await this.prisma.sowTemplate.update({
      where: { id: templateId },
      data: { isActive: false },
    });

    this.logger.log(`SoW template deactivated: ${templateId}`);
    return updated;
  }

  /**
   * Extract placeholders from template content (parses {{...}} markers).
   */
  extractPlaceholders(contentPlainText: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = contentPlainText.matchAll(regex);
    const placeholders = Array.from(matches, (m) => m[1]);
    return [...new Set(placeholders)]; // Unique
  }

  /**
   * Pre-fill a SoW template with values pulled from a company's
   * approved opportunity brief + diagnosis + base application.
   *
   * Returns the rendered plain-text content (placeholders substituted)
   * plus a values map of {placeholder → value} so the editor can show
   * which fields were auto-populated and which still need manual input.
   */
  async prefillSowFromBrief(params: {
    templateId: string;
    applicationId: string;
  }) {
    const { templateId, applicationId } = params;

    const template = await this.prisma.sowTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('SoW template not found.');

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        needDiagnosis: true,
        opportunityBrief: true,
      },
    });
    if (!application) throw new NotFoundException('Application not found.');
    if (!application.opportunityBrief) {
      throw new BadRequestException(
        'Cannot prefill — application has no opportunity brief yet.',
      );
    }

    const brief = application.opportunityBrief.internalContent as
      | Record<string, unknown>
      | null;
    const diagnosis = application.needDiagnosis?.aiContent as
      | Record<string, unknown>
      | null;

    // Build the value map. Keys here are the placeholder names
    // (e.g. {{company_name}} → "company_name") that templates can rely on.
    const values: Record<string, string> = {
      company_name: application.companyName ?? application.name ?? '',
      contact_name: application.name ?? '',
      contact_email: application.email ?? '',
      need_area: application.needArea ?? '',
      target_markets: application.targetMarkets ?? '',
      budget_range: application.budgetRange ?? '',
      urgency: application.urgency ?? '',
      recommended_role: (diagnosis?.recommendedRole as string) ?? '',
      estimated_sprint: (diagnosis?.estimatedSprint as string) ?? '',
      brief_summary: (brief?.summary as string) ?? '',
      brief_timeline: (brief?.timeline as string) ?? '',
      talent_profile: (brief?.talentProfile as string) ?? '',
      duration_days: template.durationDays
        ? String(template.durationDays)
        : '',
      fee_min: template.suggestedFeeMin ? String(template.suggestedFeeMin) : '',
      fee_max: template.suggestedFeeMax ? String(template.suggestedFeeMax) : '',
      currency: template.currency ?? 'USD',
      template_name: template.name,
      template_version: String(template.version),
    };

    // Substitute every {{placeholder}} we have a value for; leave the rest
    // as-is so the admin sees them as obvious "still TODO" markers.
    const rendered = template.contentPlainText.replace(
      /\{\{(\w+)\}\}/g,
      (match, key: string) => (key in values ? values[key] : match),
    );

    const placeholdersInTemplate = this.extractPlaceholders(template.contentPlainText);
    const missing = placeholdersInTemplate.filter(
      (p) => !(p in values) || !values[p],
    );

    return {
      templateId: template.id,
      templateName: template.name,
      templateVersion: template.version,
      applicationId: application.id,
      content: rendered,
      values,
      missingPlaceholders: missing,
    };
  }
}
