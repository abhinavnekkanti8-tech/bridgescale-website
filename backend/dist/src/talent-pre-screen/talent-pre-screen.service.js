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
var TalentPreScreenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalentPreScreenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TalentPreScreenService = TalentPreScreenService_1 = class TalentPreScreenService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TalentPreScreenService_1.name);
    }
    async getPreScreenByApplicationId(applicationId) {
        const preScreen = await this.prisma.talentPreScreen.findUnique({
            where: { applicationId },
            include: { application: true },
        });
        if (!preScreen)
            throw new common_1.NotFoundException('Talent pre-screen not found.');
        return preScreen;
    }
    async generatePreScreen(applicationId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        const existing = await this.prisma.talentPreScreen.findUnique({
            where: { applicationId },
        });
        if (existing) {
            this.logger.debug(`Pre-screen already exists for application ${applicationId}`);
            return existing;
        }
        this.logger.log(`Generating pre-screen for application ${applicationId}`);
        const scores = this.calculateScores(application);
        const preScreen = await this.prisma.talentPreScreen.create({
            data: {
                applicationId,
                recommendation: scores.recommendation,
                completenessScore: scores.completenessScore,
                consistencyScore: scores.consistencyScore,
                referenceScore: scores.referenceScore,
                assessmentScore: scores.assessmentScore,
                redFlags: scores.redFlags,
                suggestedProbeQuestions: scores.suggestedProbeQuestions,
                linkedinVerification: scores.linkedinVerification,
            },
            include: { application: true },
        });
        this.logger.log(`Pre-screen created for application ${applicationId}: ${scores.recommendation}`);
        return preScreen;
    }
    async updateRecommendation(applicationId, params) {
        const preScreen = await this.prisma.talentPreScreen.findUnique({
            where: { applicationId },
        });
        if (!preScreen)
            throw new common_1.NotFoundException('Talent pre-screen not found.');
        const updateData = {};
        if (params.recommendation) {
            if (!['STRONG_PASS', 'PASS', 'MAYBE', 'WEAK_PASS', 'FAIL'].includes(params.recommendation)) {
                throw new common_1.BadRequestException(`Invalid recommendation: ${params.recommendation}`);
            }
            updateData.recommendation = params.recommendation;
        }
        if (params.redFlags) {
            updateData.redFlags = params.redFlags;
        }
        if (params.suggestedProbeQuestions) {
            updateData.suggestedProbeQuestions = params.suggestedProbeQuestions;
        }
        const updated = await this.prisma.talentPreScreen.update({
            where: { applicationId },
            data: updateData,
            include: { application: true },
        });
        this.logger.log(`Pre-screen updated for application ${applicationId}: ${updated.recommendation}`);
        return updated;
    }
    calculateScores(application) {
        const completenessScore = this.scoreCompleteness(application);
        const consistencyScore = this.scoreConsistency(application);
        const referenceScore = this.scoreReferences(application);
        const assessmentScore = this.scoreAssessment(application);
        const avgScore = (completenessScore + consistencyScore + referenceScore + assessmentScore) / 4;
        let recommendation = 'PASS';
        if (avgScore >= 85)
            recommendation = 'STRONG_PASS';
        else if (avgScore >= 65)
            recommendation = 'PASS';
        else if (avgScore >= 45)
            recommendation = 'CONDITIONAL';
        else
            recommendation = 'FAIL';
        const redFlags = [];
        if (completenessScore < 50)
            redFlags.push({ type: 'INCOMPLETE_PROFILE', severity: 'high' });
        if (consistencyScore < 50)
            redFlags.push({ type: 'INCONSISTENT_INFO', severity: 'medium' });
        if (assessmentScore < 40)
            redFlags.push({ type: 'WEAK_ASSESSMENT', severity: 'medium' });
        return {
            recommendation,
            completenessScore,
            consistencyScore,
            referenceScore,
            assessmentScore,
            redFlags,
            suggestedProbeQuestions: this.generateProbeQuestions(application),
            linkedinVerification: {
                verified: !!application.linkedInUrl,
                confidence: application.linkedInUrl ? 'medium' : 'low',
            },
        };
    }
    scoreCompleteness(application) {
        let score = 60;
        if (application.yearsExperience)
            score += 10;
        if (application.currentRole)
            score += 10;
        if (application.linkedInUrl)
            score += 10;
        if (application.caseStudyResponse)
            score += 5;
        if (application.references)
            score += 5;
        return Math.min(score, 100);
    }
    scoreConsistency(application) {
        let score = 70;
        if (application.employmentStatus === 'EMPLOYED' && application.earliestStart) {
            score -= 10;
        }
        if (application.rateExpectationMin && application.rateExpectationMax) {
            if (application.rateExpectationMin > application.rateExpectationMax) {
                score -= 20;
            }
        }
        return Math.min(Math.max(score, 0), 100);
    }
    scoreReferences(application) {
        if (!application.references || application.references.length === 0)
            return 30;
        if (application.references.length === 1)
            return 60;
        if (application.references.length >= 2)
            return 85;
        return 70;
    }
    scoreAssessment(application) {
        if (!application.caseStudyResponse)
            return 40;
        const length = application.caseStudyResponse.length;
        if (length < 200)
            return 50;
        if (length < 500)
            return 70;
        if (length >= 500)
            return 85;
        return 60;
    }
    generateProbeQuestions(application) {
        const questions = [];
        if (application.yearsExperience && application.yearsExperience > 15) {
            questions.push("Tell us about your most significant leadership achievement in recent years.");
        }
        if (application.currentRole && application.currentRole.toLowerCase().includes('founder')) {
            questions.push("What was your biggest lesson from building/scaling your company?");
        }
        if (application.markets && Array.isArray(application.markets)) {
            questions.push(`What's your strategy for success in ${application.markets[0] || 'emerging'} markets?`);
        }
        questions.push("How do you measure success in a fractional role?");
        questions.push("What type of founder/company environment brings out your best work?");
        return questions.slice(0, 5);
    }
};
exports.TalentPreScreenService = TalentPreScreenService;
exports.TalentPreScreenService = TalentPreScreenService = TalentPreScreenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TalentPreScreenService);
//# sourceMappingURL=talent-pre-screen.service.js.map