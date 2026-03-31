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
var ContractsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let ContractsService = ContractsService_1 = class ContractsService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(ContractsService_1.name);
    }
    async generateSow(dto) {
        const template = this.getSowTemplate(dto.packageType);
        const sow = await this.prisma.statementOfWork.create({
            data: {
                shortlistId: dto.shortlistId,
                startupProfileId: dto.startupProfileId,
                operatorId: dto.operatorId,
                packageType: dto.packageType,
                title: template.title,
                scope: template.scope,
                deliverables: template.deliverables,
                timeline: template.timeline,
                weeklyHours: template.weeklyHours,
                totalPriceUsd: template.totalPriceUsd,
                nonCircumvention: true,
                promptVersion: 'sow_gen_v1.0',
                modelName: this.aiService.getModelName(),
            },
        });
        await this.prisma.sowVersion.create({
            data: {
                sowId: sow.id,
                version: 1,
                content: {
                    title: sow.title,
                    scope: sow.scope,
                    deliverables: sow.deliverables,
                    timeline: sow.timeline,
                    weeklyHours: sow.weeklyHours,
                    totalPriceUsd: sow.totalPriceUsd,
                },
                changedBy: 'SYSTEM',
                changeNote: 'AI-generated initial draft',
            },
        });
        this.logger.log(`SoW ${sow.id} generated for package ${dto.packageType}`);
        return sow;
    }
    getSowTemplate(packageType) {
        const templates = {
            PIPELINE_SPRINT: {
                title: 'Pipeline Sprint — Statement of Work',
                scope: 'Structured 8-week outbound sales campaign targeting ICP-aligned prospects in designated diaspora markets. Operator executes weekly outreach sequences, manages pipeline, and delivers weekly progress reports. All activities conducted through the Antigravity platform.',
                deliverables: '• ICP Targeting & List Build (Week 1–2)\n• Outreach Sequence Design & Launch (Week 2–3)\n• Weekly Pipeline Reports with qualified lead handoffs\n• 4× Pipeline Review Calls (Bi-weekly)\n• Final Campaign Report with recommendations',
                timeline: 'Week 1–2: Setup & ICP | Week 3–6: Execution | Week 7–8: Handoff & Review',
                weeklyHours: 15,
                totalPriceUsd: 5000,
            },
            BD_SPRINT: {
                title: 'BD Sprint — Statement of Work',
                scope: 'Structured 8-week business development sprint focused on partnership and channel activation in designated markets. Operator maps channel landscape, initiates alliance outreach, and manages partnership deal flow through the Antigravity platform.',
                deliverables: '• Channel Landscape Mapping (Week 1–2)\n• Alliance Outreach Campaign (Week 2–6)\n• Partnership Term Sheet Drafts\n• 4× BD Review Calls (Bi-weekly)\n• Final Partnership Pipeline Report',
                timeline: 'Week 1–2: Mapping | Week 3–6: Outreach | Week 7–8: Deal Flow & Handoff',
                weeklyHours: 15,
                totalPriceUsd: 6000,
            },
            FRACTIONAL_RETAINER: {
                title: 'Fractional Sales Leadership Retainer — Statement of Work',
                scope: 'Ongoing fractional sales leadership engagement. Operator provides strategic direction, team coaching, pipeline management, process optimization, and quarterly business reviews. All activities logged and tracked through the Antigravity platform.',
                deliverables: '• Sales Strategy & Process Design (Month 1)\n• Weekly Team Coaching Sessions\n• Monthly Pipeline & Forecast Reports\n• Quarterly Business Reviews (QBR)\n• Ongoing CRM Hygiene & Optimization',
                timeline: '12-week initial term, renewable quarterly upon mutual agreement.',
                weeklyHours: 20,
                totalPriceUsd: 15000,
            },
        };
        return templates[packageType] ?? templates.PIPELINE_SPRINT;
    }
    async editSow(sowId, dto, userId) {
        const sow = await this.findOneSow(sowId);
        if (sow.status === 'SIGNED' || sow.status === 'LOCKED') {
            throw new common_1.BadRequestException('Cannot edit a signed or locked SoW.');
        }
        const newVersion = sow.currentVersion + 1;
        const updatedFields = {};
        if (dto.title !== undefined)
            updatedFields.title = dto.title;
        if (dto.scope !== undefined)
            updatedFields.scope = dto.scope;
        if (dto.deliverables !== undefined)
            updatedFields.deliverables = dto.deliverables;
        if (dto.timeline !== undefined)
            updatedFields.timeline = dto.timeline;
        if (dto.weeklyHours !== undefined)
            updatedFields.weeklyHours = dto.weeklyHours;
        if (dto.totalPriceUsd !== undefined)
            updatedFields.totalPriceUsd = dto.totalPriceUsd;
        const updated = await this.prisma.statementOfWork.update({
            where: { id: sowId },
            data: {
                ...updatedFields,
                currentVersion: newVersion,
                status: 'DRAFT',
            },
        });
        await this.prisma.sowVersion.create({
            data: {
                sowId,
                version: newVersion,
                content: {
                    title: updated.title,
                    scope: updated.scope,
                    deliverables: updated.deliverables,
                    timeline: updated.timeline,
                    weeklyHours: updated.weeklyHours,
                    totalPriceUsd: updated.totalPriceUsd,
                },
                changedBy: userId,
                changeNote: dto.changeNote,
            },
        });
        this.logger.log(`SoW ${sowId} updated to version ${newVersion}`);
        return updated;
    }
    async submitForReview(sowId) {
        return this.prisma.statementOfWork.update({
            where: { id: sowId },
            data: { status: 'REVIEW' },
        });
    }
    async approveSow(sowId) {
        const sow = await this.findOneSow(sowId);
        if (sow.status !== 'REVIEW')
            throw new common_1.BadRequestException('SoW must be in REVIEW status to approve.');
        const updated = await this.prisma.statementOfWork.update({
            where: { id: sowId },
            data: { status: 'APPROVED' },
        });
        await this.prisma.contract.create({
            data: { sowId },
        });
        return updated;
    }
    async signContract(contractId, role, dto) {
        const contract = await this.findOneContract(contractId);
        if (dto.idempotencyKey) {
            const existing = await this.prisma.contract.findUnique({
                where: { idempotencyKey: dto.idempotencyKey },
            });
            if (existing)
                return existing;
        }
        if (contract.status === 'FULLY_SIGNED' || contract.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Contract is already fully signed or cancelled.');
        }
        const updateData = {};
        if (role === 'STARTUP') {
            if (contract.startupSignedAt)
                throw new common_1.ConflictException('Startup has already signed.');
            updateData.startupSignedAt = new Date();
            updateData.startupSignatureId = dto.signatureId;
            updateData.status = contract.operatorSignedAt ? 'FULLY_SIGNED' : 'STARTUP_SIGNED';
        }
        else {
            if (contract.operatorSignedAt)
                throw new common_1.ConflictException('Operator has already signed.');
            updateData.operatorSignedAt = new Date();
            updateData.operatorSignatureId = dto.signatureId;
            updateData.status = contract.startupSignedAt ? 'FULLY_SIGNED' : 'OPERATOR_SIGNED';
        }
        if (updateData.status === 'FULLY_SIGNED') {
            updateData.fullySignedAt = new Date();
        }
        if (dto.idempotencyKey) {
            updateData.idempotencyKey = dto.idempotencyKey;
        }
        const updated = await this.prisma.contract.update({
            where: { id: contractId },
            data: updateData,
        });
        await this.logDocumentAction(contractId, `${role}_SIGNED`, dto.signatureId);
        if (updated.status === 'FULLY_SIGNED') {
            await this.prisma.statementOfWork.update({
                where: { id: contract.sowId },
                data: { status: 'LOCKED' },
            });
            this.logger.log(`Contract ${contractId} fully signed — SoW locked.`);
        }
        return updated;
    }
    async unlockContacts(contractId) {
        const contract = await this.findOneContract(contractId);
        if (contract.status !== 'FULLY_SIGNED') {
            throw new common_1.BadRequestException('Both signatures required before unlocking contacts.');
        }
        return this.prisma.contract.update({
            where: { id: contractId },
            data: { contactsUnlocked: true },
        });
    }
    async logDocumentAction(contractId, action, performedBy, ipAddress, userAgent) {
        return this.prisma.documentLog.create({
            data: { contractId, action, performedBy, ipAddress, userAgent },
        });
    }
    async getDocumentLogs(contractId) {
        return this.prisma.documentLog.findMany({
            where: { contractId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneSow(sowId) {
        const sow = await this.prisma.statementOfWork.findUnique({
            where: { id: sowId },
            include: { versions: { orderBy: { version: 'desc' } }, contract: true },
        });
        if (!sow)
            throw new common_1.NotFoundException('Statement of Work not found.');
        return sow;
    }
    async findOneContract(contractId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { sow: true, documentLogs: { orderBy: { createdAt: 'desc' }, take: 10 } },
        });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found.');
        return contract;
    }
    async findAll() {
        return this.prisma.statementOfWork.findMany({
            orderBy: { createdAt: 'desc' },
            include: { contract: true },
        });
    }
    async findByStartup(startupProfileId) {
        return this.prisma.statementOfWork.findMany({
            where: { startupProfileId },
            orderBy: { createdAt: 'desc' },
            include: { contract: true },
        });
    }
    async findByOperator(operatorId) {
        return this.prisma.statementOfWork.findMany({
            where: { operatorId },
            orderBy: { createdAt: 'desc' },
            include: { contract: true },
        });
    }
    async getSowVersions(sowId) {
        return this.prisma.sowVersion.findMany({
            where: { sowId },
            orderBy: { version: 'desc' },
        });
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = ContractsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map