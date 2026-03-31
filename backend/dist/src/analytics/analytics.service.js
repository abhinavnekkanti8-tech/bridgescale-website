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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardMetrics() {
        const [totalStartups, totalOperators, activeEngagements, completedEngagements, invoices, openMatches, engagements] = await Promise.all([
            this.prisma.startupProfile.count(),
            this.prisma.operatorProfile.count({ where: { verification: 'VERIFIED' } }),
            this.prisma.engagement.count({ where: { status: 'ACTIVE' } }),
            this.prisma.engagement.count({ where: { status: 'COMPLETED' } }),
            this.prisma.invoice.findMany(),
            this.prisma.matchCandidate.count({ where: { interest: 'PENDING' } }),
            this.prisma.engagement.findMany({ select: { healthScore: true, status: true } })
        ]);
        const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
        const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID').length;
        const mrr = totalInvoiced * 0.1;
        const atRisk = engagements.filter((e) => e.status === 'ACTIVE' && e.healthScore < 50).length;
        const onTrack = engagements.filter((e) => e.status === 'ACTIVE' && e.healthScore >= 80).length;
        return {
            platformHealth: {
                totalStartups,
                totalOperators,
                activeEngagements,
                completedEngagements,
            },
            financials: {
                mrr,
                totalInvoiced,
                unpaidInvoices,
            },
            matching: {
                openMatches,
                avgTimeDays: 4.2,
            },
            engagementHealth: {
                atRisk,
                onTrack,
            }
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map