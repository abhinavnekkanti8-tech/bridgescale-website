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
var DiagnosesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
let DiagnosesService = DiagnosesService_1 = class DiagnosesService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(DiagnosesService_1.name);
    }
    async getDiagnosis(diagnosisId) {
        const diagnosis = await this.prisma.needDiagnosis.findUnique({
            where: { id: diagnosisId },
            include: { application: true },
        });
        if (!diagnosis)
            throw new common_1.NotFoundException('Diagnosis not found.');
        return diagnosis;
    }
    async listDiagnoses(status, limit = 20, offset = 0) {
        const diagnoses = await this.prisma.needDiagnosis.findMany({
            where: status ? { status } : undefined,
            include: {
                application: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        type: true,
                        companyName: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { generatedAt: 'desc' },
            take: limit,
            skip: offset,
        });
        const total = await this.prisma.needDiagnosis.count({
            where: status ? { status } : undefined,
        });
        return { diagnoses, total, limit, offset };
    }
    async updateDiagnosis(diagnosisId, params) {
        const diagnosis = await this.prisma.needDiagnosis.findUnique({
            where: { id: diagnosisId },
            include: { application: true },
        });
        if (!diagnosis)
            throw new common_1.NotFoundException('Diagnosis not found.');
        const updateData = {};
        if (params.status) {
            if (!['DRAFT_AI', 'UNDER_REVIEW', 'READY_FOR_CLIENT', 'APPROVED', 'REVISION_REQUESTED'].includes(params.status)) {
                throw new common_1.BadRequestException(`Invalid status: ${params.status}`);
            }
            updateData.status = params.status;
            if (params.status === 'APPROVED') {
                updateData.finalizedAt = new Date();
            }
        }
        if (params.humanEditedContent) {
            updateData.humanEditedContent = params.humanEditedContent;
        }
        if (params.clientFacingContent) {
            updateData.clientFacingContent = params.clientFacingContent;
        }
        if (params.reviewerNotes !== undefined) {
            updateData.reviewerNotes = params.reviewerNotes;
        }
        if (params.revisionNotes !== undefined) {
            updateData.revisionNotes = params.revisionNotes;
        }
        const updated = await this.prisma.needDiagnosis.update({
            where: { id: diagnosisId },
            data: updateData,
            include: { application: true },
        });
        this.logger.log(`Diagnosis ${diagnosisId} updated: status → ${updated.status}`);
        if (params.status === 'APPROVED' && diagnosis.application) {
            this.emailService
                .sendDiagnosisApproved({
                email: diagnosis.application.email,
                name: diagnosis.application.name,
                type: diagnosis.application.type,
            })
                .catch((err) => this.logger.error(`Failed to send approval email to ${diagnosis.application.email}: ${err.message}`));
        }
        return updated;
    }
    async getPendingDiagnoses() {
        return this.prisma.needDiagnosis.findMany({
            where: { status: 'DRAFT_AI' },
            include: {
                application: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        type: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { generatedAt: 'asc' },
        });
    }
};
exports.DiagnosesService = DiagnosesService;
exports.DiagnosesService = DiagnosesService = DiagnosesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], DiagnosesService);
//# sourceMappingURL=diagnoses.service.js.map