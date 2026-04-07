"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SowTemplatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SowTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SowTemplatesService = SowTemplatesService_1 = class SowTemplatesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SowTemplatesService_1.name);
    }
    async getTemplates(filter) {
        const templates = await this.prisma.sowTemplate.findMany({
            where: {
                isActive: true,
                ...(filter?.type ? { templateType: filter.type } : {}),
            },
            orderBy: [{ templateType: 'asc' }, { version: 'desc' }],
        });
        return templates;
    }
    async getTemplate(templateId) {
        const template = await this.prisma.sowTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('SoW template not found.');
        }
        return template;
    }
    async updateTemplate(templateId, updates) {
        const template = await this.prisma.sowTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('SoW template not found.');
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
    async duplicateTemplate(templateId) {
        const template = await this.prisma.sowTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('SoW template not found.');
        }
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
    async deactivateTemplate(templateId) {
        const template = await this.prisma.sowTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('SoW template not found.');
        }
        const updated = await this.prisma.sowTemplate.update({
            where: { id: templateId },
            data: { isActive: false },
        });
        this.logger.log(`SoW template deactivated: ${templateId}`);
        return updated;
    }
    extractPlaceholders(contentPlainText) {
        const regex = /\{\{(\w+)\}\}/g;
        const matches = contentPlainText.matchAll(regex);
        const placeholders = Array.from(matches, (m) => m[1]);
        return [...new Set(placeholders)];
    }
};
exports.SowTemplatesService = SowTemplatesService;
exports.SowTemplatesService = SowTemplatesService = SowTemplatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SowTemplatesService);
//# sourceMappingURL=sow-templates.service.js.map