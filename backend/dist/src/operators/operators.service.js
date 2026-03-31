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
var OperatorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const crypto = require("crypto");
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
let OperatorsService = OperatorsService_1 = class OperatorsService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(OperatorsService_1.name);
    }
    async createInvite(dto) {
        const existing = await this.prisma.inviteToken.findFirst({
            where: { email: dto.email, status: 'SENT' },
        });
        if (existing)
            throw new common_1.ConflictException('An active invite already exists for this email.');
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const invite = await this.prisma.inviteToken.create({
            data: {
                email: dto.email,
                token,
                role: dto.role,
                orgName: dto.orgName,
                expiresAt,
            },
        });
        this.logger.log(`Invite created for ${dto.email}. Token: ${token}`);
        return { ...invite, inviteUrl: `/auth/register?token=${token}` };
    }
    async acceptInvite(token, name, password) {
        const invite = await this.prisma.inviteToken.findUnique({ where: { token } });
        if (!invite)
            throw new common_1.NotFoundException('Invalid invite token.');
        if (invite.status !== 'SENT')
            throw new common_1.ConflictException('Invite already used or revoked.');
        if (invite.expiresAt < new Date())
            throw new common_1.ConflictException('Invite has expired.');
        const passwordHash = hashPassword(password);
        const result = await this.prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: { name: invite.orgName || `${name}'s Organization`, orgType: 'OPERATOR_ENTITY' },
            });
            const user = await tx.user.create({
                data: { name, email: invite.email, passwordHash },
            });
            await tx.membership.create({
                data: { userId: user.id, orgId: org.id, membershipRole: invite.role, status: 'ACTIVE' },
            });
            await tx.inviteToken.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } });
            return { userId: user.id, orgId: org.id, email: user.email };
        });
        return result;
    }
    async listInvites() {
        return this.prisma.inviteToken.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async revokeInvite(inviteId) {
        return this.prisma.inviteToken.update({
            where: { id: inviteId },
            data: { status: 'REVOKED' },
        });
    }
    async createProfile(orgId, dto) {
        const existing = await this.prisma.operatorProfile.findUnique({ where: { operatorId: orgId } });
        if (existing)
            return this.updateProfile(existing.id, orgId, dto);
        return this.prisma.operatorProfile.create({
            data: {
                operatorId: orgId,
                lanes: dto.lanes,
                regions: dto.regions,
                functions: dto.functions,
                experienceTags: dto.experienceTags ?? [],
                yearsExperience: dto.yearsExperience,
                linkedIn: dto.linkedIn,
                references: dto.references ?? undefined,
                availability: dto.availability,
                bio: dto.bio,
            },
        });
    }
    async updateProfile(profileId, orgId, dto) {
        const profile = await this.findOne(profileId);
        if (profile.operatorId !== orgId)
            throw new common_1.ForbiddenException('You do not own this profile.');
        return this.prisma.operatorProfile.update({
            where: { id: profileId },
            data: { ...dto, references: dto.references ?? undefined },
        });
    }
    async findOne(profileId) {
        const profile = await this.prisma.operatorProfile.findUnique({
            where: { id: profileId },
            include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        if (!profile)
            throw new common_1.NotFoundException('Operator profile not found.');
        return profile;
    }
    async findByOrgId(orgId) {
        return this.prisma.operatorProfile.findUnique({
            where: { operatorId: orgId },
            include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
    }
    async findAll() {
        return this.prisma.operatorProfile.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                operator: { select: { id: true, name: true, country: true } },
                scores: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });
    }
    async requestScore(profileId) {
        const profile = await this.findOne(profileId);
        this.runScoringJob(profile).catch((err) => {
            this.logger.error(`Quality scoring failed for ${profileId}:`, err);
        });
        return { status: 'scoring_queued', profileId };
    }
    async runScoringJob(profile) {
        this.logger.log(`Starting quality scoring for operator ${profile.id}`);
        const scoreOutput = this.buildMockSupplyScore(profile);
        await this.prisma.supplyQualityScore.create({
            data: {
                profileId: profile.id,
                scoreTotal: scoreOutput.totalScore,
                scoreBreakdown: scoreOutput.componentScores,
                blockers: scoreOutput.blockers,
                recommendation: scoreOutput.recommendation,
                tier: scoreOutput.tier,
                generatedBy: 'AI',
                promptVersion: 'supply_quality_v1.0',
                modelName: this.aiService.getModelName(),
                temperature: this.aiService.getTemperature(),
            },
        });
        await this.prisma.operatorProfile.update({
            where: { id: profile.id },
            data: { tier: scoreOutput.tier },
        });
        this.logger.log(`Scored operator ${profile.id}: ${scoreOutput.totalScore}/100 (${scoreOutput.tier})`);
    }
    buildMockSupplyScore(profile) {
        const hasRefs = Boolean(profile.references);
        const years = profile.yearsExperience ?? 0;
        const lanes = profile.lanes ?? [];
        const bio = profile.bio ?? '';
        const domainExpertise = Math.min(20, years * 3 + 5);
        const regionExperience = 12;
        const referencesVerified = hasRefs ? 13 : 5;
        const trackRecord = Math.min(15, years * 2 + 3);
        const platformFit = lanes.length >= 2 ? 13 : 9;
        const availability = 8;
        const responsiveness = bio.length > 50 ? 9 : 6;
        const totalScore = domainExpertise + regionExperience + referencesVerified + trackRecord + platformFit + availability + responsiveness;
        const tier = totalScore >= 80 ? 'TIER_A' : totalScore >= 65 ? 'TIER_B' : 'TIER_C';
        const blockers = [];
        if (!hasRefs)
            blockers.push('No verified references — provide at least 2 professional references.');
        if (years < 3)
            blockers.push('Limited experience — operators with 3+ years receive higher tier scores.');
        return {
            componentScores: { domainExpertise, regionExperience, referencesVerified, trackRecord, platformFit, availability, responsiveness },
            totalScore,
            blockers,
            recommendation: `Score: ${totalScore}/100 (${tier.replace('_', ' ')}). ${tier === 'TIER_C' ? 'Resolve blockers to improve tier.' : 'Eligible for matching.'}`,
            tier,
        };
    }
    async verifyOperator(profileId, action) {
        return this.prisma.operatorProfile.update({
            where: { id: profileId },
            data: { verification: action },
        });
    }
    async overrideScore(scoreId, admin, data) {
        if (admin.role !== client_1.MembershipRole.PLATFORM_ADMIN) {
            throw new common_1.ForbiddenException('Only Platform Admins can override scores.');
        }
        const tier = data.scoreTotal >= 80 ? 'TIER_A' : data.scoreTotal >= 65 ? 'TIER_B' : 'TIER_C';
        return this.prisma.supplyQualityScore.update({
            where: { id: scoreId },
            data: {
                scoreTotal: data.scoreTotal,
                overrideReason: data.overrideReason,
                adminOverride: true,
                generatedBy: `ADMIN:${admin.id}`,
                tier: tier,
            },
        });
    }
    async getScores(profileId) {
        return this.prisma.supplyQualityScore.findMany({
            where: { profileId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.OperatorsService = OperatorsService;
exports.OperatorsService = OperatorsService = OperatorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], OperatorsService);
//# sourceMappingURL=operators.service.js.map