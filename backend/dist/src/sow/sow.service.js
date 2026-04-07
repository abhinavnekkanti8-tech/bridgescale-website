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
var SowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SowService = SowService_1 = class SowService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SowService_1.name);
    }
    async getTemplates() {
        const templates = await this.prisma.sowTemplate.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
        return templates;
    }
    async getTemplate(templateId) {
        const template = await this.prisma.sowTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template)
            throw new common_1.NotFoundException('SoW template not found.');
        return template;
    }
    async generateSoW(params) {
        const template = await this.prisma.sowTemplate.findUnique({
            where: { id: params.templateId },
        });
        if (!template)
            throw new common_1.NotFoundException('SoW template not found.');
        let contentText = template.contentPlainText;
        const substitutions = {
            '[COMPANY_NAME]': params.companyName,
            '[TALENT_NAME]': params.talentName,
            '[DURATION_DAYS]': String(params.expectedDurationDays),
            '[FEE_USD]': String(params.feeUsd),
            '[WEEKLY_HOURS]': String(params.weeklyHours || 40),
            '[START_DATE]': new Date().toLocaleDateString('en-GB'),
            '[END_DATE]': new Date(Date.now() + params.expectedDurationDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
            ...params.placeholderValues,
        };
        for (const [key, value] of Object.entries(substitutions)) {
            contentText = contentText.replaceAll(key, value);
        }
        const sow = await this.prisma.statementOfWork.create({
            data: {
                shortlistId: params.shortlistId,
                startupProfileId: params.startupProfileId,
                operatorId: params.operatorId,
                packageType: params.packageType || client_1.PackageType.PIPELINE_SPRINT,
                title: `${params.companyName} - ${params.talentName}`,
                scope: contentText.substring(0, 500),
                deliverables: 'As per SoW',
                timeline: `${params.expectedDurationDays} days`,
                weeklyHours: params.weeklyHours || 40,
                totalPriceUsd: params.feeUsd,
                status: client_1.SowStatus.DRAFT,
            },
        });
        const version = await this.prisma.sowVersion.create({
            data: {
                sowId: sow.id,
                version: 1,
                content: { text: contentText, placeholders: substitutions },
                changedBy: 'SYSTEM',
                changeNote: 'Initial version from template',
            },
        });
        this.logger.log(`SoW generated: ${sow.id} (v${version.version})`);
        return { sow, version };
    }
    async updateSoW(sowId, contentText, changedBy, changeNote) {
        const sow = await this.prisma.statementOfWork.findUnique({
            where: { id: sowId },
            include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
        });
        if (!sow)
            throw new common_1.NotFoundException('SoW not found.');
        const latestVersion = sow.versions[0];
        const nextVersion = (latestVersion?.version || 0) + 1;
        const newVersion = await this.prisma.sowVersion.create({
            data: {
                sowId,
                version: nextVersion,
                content: { text: contentText },
                changedBy,
                changeNote,
            },
        });
        await this.prisma.statementOfWork.update({
            where: { id: sowId },
            data: { currentVersion: nextVersion },
        });
        this.logger.log(`SoW updated: ${sowId} → v${nextVersion}`);
        return newVersion;
    }
    async approveSoW(sowId) {
        const sow = await this.prisma.statementOfWork.findUnique({
            where: { id: sowId },
        });
        if (!sow)
            throw new common_1.NotFoundException('SoW not found.');
        if (sow.status !== client_1.SowStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft SoWs can be approved.');
        }
        const updated = await this.prisma.statementOfWork.update({
            where: { id: sowId },
            data: { status: client_1.SowStatus.APPROVED },
        });
        this.logger.log(`SoW approved: ${sowId}`);
        return updated;
    }
    async getSoW(sowId) {
        const sow = await this.prisma.statementOfWork.findUnique({
            where: { id: sowId },
            include: { versions: { orderBy: { version: 'asc' } } },
        });
        if (!sow)
            throw new common_1.NotFoundException('SoW not found.');
        return sow;
    }
};
exports.SowService = SowService;
exports.SowService = SowService = SowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SowService);
//# sourceMappingURL=sow.service.js.map