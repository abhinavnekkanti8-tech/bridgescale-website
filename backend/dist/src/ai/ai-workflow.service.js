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
var AiWorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const ai_service_1 = require("./ai.service");
let AiWorkflowService = AiWorkflowService_1 = class AiWorkflowService {
    constructor(prisma, aiService, emailService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(AiWorkflowService_1.name);
    }
    async generateDiagnosisForApplication(applicationId) {
        try {
            const application = await this.prisma.application.findUnique({
                where: { id: applicationId },
            });
            if (!application) {
                this.logger.warn(`Application ${applicationId} not found for diagnosis generation.`);
                return;
            }
            const existingDiagnosis = await this.prisma.needDiagnosis.findUnique({
                where: { applicationId },
            });
            if (existingDiagnosis) {
                this.logger.debug(`Diagnosis already exists for application ${applicationId}`);
                return;
            }
            this.logger.log(`Generating diagnosis for application ${applicationId} (${application.type})`);
            const appData = {
                type: application.type,
                name: application.name,
                email: application.email,
                companyName: application.companyName ?? undefined,
                companyStage: application.companyStage ?? undefined,
                needArea: application.needArea ?? undefined,
                targetMarkets: application.targetMarkets ?? undefined,
                budgetRange: application.budgetRange ?? undefined,
                urgency: application.urgency ?? undefined,
                notes: application.notes ?? undefined,
                currentRole: application.currentRole ?? undefined,
                currentEmployer: application.currentEmployer ?? undefined,
                yearsExperience: application.yearsExperience ?? undefined,
                seniorityLevel: application.seniorityLevel ?? undefined,
            };
            const diagnosis = await this.aiService.generateNeedsDiagnosis(appData);
            const needDiagnosis = await this.prisma.needDiagnosis.create({
                data: {
                    applicationId,
                    status: 'DRAFT_AI',
                    aiContent: {
                        analysis: diagnosis.analysis,
                        challenges: diagnosis.challenges,
                        opportunities: diagnosis.opportunities,
                        recommendedRole: diagnosis.recommendedRole,
                        estimatedSprint: diagnosis.estimatedSprint,
                    },
                    clientFacingContent: {
                        status: 'PENDING_REVIEW',
                        summary: diagnosis.analysis,
                        recommendedRole: diagnosis.recommendedRole,
                        lastUpdatedAt: new Date().toISOString(),
                    },
                    aiModel: 'gpt-4o',
                    promptVersion: 'demand_readiness_v1.0',
                },
            });
            this.logger.log(`Diagnosis created for application ${applicationId}: role=${diagnosis.recommendedRole}`);
            this.emailService
                .sendDiagnosisGenerated({
                email: application.email,
                name: application.name,
                type: application.type,
                recommendedRole: diagnosis.recommendedRole,
            })
                .catch((err) => this.logger.error(`Failed to send diagnosis notification to ${application.email}: ${err.message}`));
            return;
        }
        catch (err) {
            this.logger.error(`Failed to generate diagnosis for application ${applicationId}: ${err.message}`);
        }
    }
};
exports.AiWorkflowService = AiWorkflowService;
exports.AiWorkflowService = AiWorkflowService = AiWorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService,
        email_service_1.EmailService])
], AiWorkflowService);
//# sourceMappingURL=ai-workflow.service.js.map