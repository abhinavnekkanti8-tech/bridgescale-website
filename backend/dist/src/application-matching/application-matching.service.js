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
var ApplicationMatchingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationMatchingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ApplicationMatchingService = ApplicationMatchingService_1 = class ApplicationMatchingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ApplicationMatchingService_1.name);
    }
    async createShortlist(companyApplicationId, params) {
        const company = await this.prisma.application.findUnique({
            where: { id: companyApplicationId },
        });
        if (!company)
            throw new common_1.NotFoundException('Application not found.');
        if (company.type !== 'COMPANY') {
            throw new common_1.BadRequestException('Only company applications can create shortlists.');
        }
        const shortlist = await this.prisma.matchShortlist.create({
            data: {
                startupProfileId: companyApplicationId,
                promptVersion: 'app_matching_v1.0',
            },
        });
        this.logger.log(`Shortlist created for company ${companyApplicationId}`);
        return shortlist;
    }
    async getShortlist(shortlistId) {
        const shortlist = await this.prisma.matchShortlist.findUnique({
            where: { id: shortlistId },
            include: { candidates: true },
        });
        if (!shortlist)
            throw new common_1.NotFoundException('Shortlist not found.');
        return shortlist;
    }
    async addCandidateToShortlist(shortlistId, talentApplicationId, params) {
        const shortlist = await this.prisma.matchShortlist.findUnique({
            where: { id: shortlistId },
            include: { candidates: true },
        });
        if (!shortlist)
            throw new common_1.NotFoundException('Shortlist not found.');
        const talent = await this.prisma.application.findUnique({
            where: { id: talentApplicationId },
            include: { talentPreScreen: true },
        });
        if (!talent)
            throw new common_1.NotFoundException('Talent application not found.');
        if (talent.type !== 'TALENT') {
            throw new common_1.BadRequestException('Only talent applications can be candidates.');
        }
        const existing = shortlist.candidates.find((c) => c.operatorId === talentApplicationId);
        if (existing) {
            return this.updateCandidate(existing.id, params || {});
        }
        const matchScore = params?.matchScore ?? this.calculateFitScore(talent);
        const candidate = await this.prisma.matchCandidate.create({
            data: {
                shortlistId,
                operatorId: talentApplicationId,
                matchScore,
                explanation: params?.explanation || '',
                scoreBreakdown: {
                    roleAlignment: Math.floor(matchScore * 0.35),
                    experience: Math.floor(matchScore * 0.25),
                    marketKnowledge: Math.floor(matchScore * 0.2),
                    availability: Math.floor(matchScore * 0.15),
                    rate: Math.floor(matchScore * 0.05),
                },
            },
        });
        this.logger.log(`Candidate added to shortlist: match score ${matchScore}%`);
        return candidate;
    }
    async updateCandidate(candidateId, params) {
        const candidate = await this.prisma.matchCandidate.findUnique({
            where: { id: candidateId },
        });
        if (!candidate)
            throw new common_1.NotFoundException('Candidate not found.');
        const updateData = {};
        if (params.matchScore !== undefined) {
            if (params.matchScore < 0 || params.matchScore > 100) {
                throw new common_1.BadRequestException('Match score must be 0-100.');
            }
            updateData.matchScore = params.matchScore;
        }
        if (params.explanation) {
            updateData.explanation = params.explanation;
        }
        const updated = await this.prisma.matchCandidate.update({
            where: { id: candidateId },
            data: updateData,
        });
        this.logger.log(`Candidate ${candidateId} updated: match score ${updated.matchScore}%`);
        return updated;
    }
    async getTopCandidates(shortlistId, limit = 10) {
        const candidates = await this.prisma.matchCandidate.findMany({
            where: { shortlistId },
            orderBy: { matchScore: 'desc' },
            take: limit,
        });
        return candidates;
    }
    calculateFitScore(talent) {
        let score = 50;
        if (talent.currentRole) {
            const role = talent.currentRole.toLowerCase();
            if (role.includes('founder') || role.includes('ceo'))
                score += 20;
            else if (role.includes('vp') || role.includes('head'))
                score += 18;
            else if (role.includes('senior') || role.includes('lead'))
                score += 15;
            else if (role.includes('manager'))
                score += 10;
        }
        if (talent.yearsExperience) {
            if (talent.yearsExperience >= 15)
                score += 15;
            else if (talent.yearsExperience >= 10)
                score += 12;
            else if (talent.yearsExperience >= 5)
                score += 8;
            else if (talent.yearsExperience >= 2)
                score += 4;
        }
        if (talent.seniorityLevel) {
            const seniority = talent.seniorityLevel.toLowerCase();
            if (seniority.includes('executive') || seniority.includes('c-'))
                score += 10;
            else if (seniority.includes('senior'))
                score += 7;
            else if (seniority.includes('mid'))
                score += 4;
        }
        if (talent.markets && Array.isArray(talent.markets) && talent.markets.length > 0) {
            score += Math.min(talent.markets.length * 3, 10);
        }
        if (talent.availabilityHours && talent.availabilityHours >= 20) {
            score += 5;
        }
        return Math.min(Math.max(score, 0), 100);
    }
};
exports.ApplicationMatchingService = ApplicationMatchingService;
exports.ApplicationMatchingService = ApplicationMatchingService = ApplicationMatchingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationMatchingService);
//# sourceMappingURL=application-matching.service.js.map